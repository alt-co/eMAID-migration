import fs from 'fs/promises';
import parse from 'csv-parse/lib/sync';
import BigNumber from "bignumber.js";
import { Inject, Injectable } from "injection-js";
import sftp from 'ssh2-sftp-client';
import * as openpgp from 'openpgp';
import { take } from 'rxjs/operators';

import { CustomerSource } from "services/CustomerSource";
import { AltcoinomyCustomerData, AltcoinomyCustomer } from "./models/AltcoinomyCustomer";
import { logger } from 'util/logger';
import { SupportedToken } from 'models/SupportedTokens';
import { CustomerMap } from 'models/Customer';
import {
  PGPKeyFile,
  PGPKeyPassword,
  SftpHost,
  SftpKeyFile,
  SftpKeyPassword,
  SftpFilePrefix,
  SftpUser,
  TokenAmountColumnName,
  TokenSenderAddressColumnName
} from "./models/AltcoinomyConfig";
import { CustomerStore } from 'stores/CustomerStore';
import { AltcoinomyService } from './AltcoinomyService';
import { AxiosError } from 'axios';
import { OmniExplorerService } from 'infrastructure/omni/OmniExplorerService';

const [
  COLUMN_SUBSCRIPTION_ID,
  COLUMN_USERNAME,
  COLUMN_EMAIL,
  COLUMN_TOKEN_DELIVERY_ADDRESS,
  COLUMN_KYC_STATUS,
  COLUMN_PAYMENT_STATUS,
  COLUMN_REFERRAL,
] = AltcoinomyCustomerData;

type Record = { [ col: string ]: string };

@Injectable()
export class AltcoinomyCustomerDataSourceSFTP extends CustomerSource<'Altcoinomy'> {
  public readonly customerSourceName = 'Altcoinomy';

  readonly sftpClient = new sftp();
  readonly remoteCsvDir = '/KYC_Files';

  constructor(
    @Inject(TokenAmountColumnName) readonly tokenAmountColumnName: string,
    @Inject(TokenSenderAddressColumnName) readonly tokenSenderAddressColumnName: string,
    @Inject(SftpHost) readonly sftpHost: string,
    @Inject(SftpUser) readonly sftpUser: string,
    @Inject(SftpKeyFile) readonly sftpKeyFile: string,
    @Inject(SftpKeyPassword) readonly sftpKeyPassword: string,
    @Inject(SftpFilePrefix) readonly sftpFilePrefix: string,
    @Inject(PGPKeyFile) readonly pgpKeyFile: string,
    @Inject(PGPKeyPassword) readonly pgpKeyPassword: string,
    @Inject(OmniExplorerService) readonly omniExplorer: OmniExplorerService,
    protected readonly customerStore: CustomerStore,
    protected readonly altcoinomyApi: AltcoinomyService,
  ) {
    super();
  }

  public async getAddressesToMint(token: SupportedToken): Promise<CustomerMap<'Altcoinomy'>> {
    const minted = await this.customerStore.tokenCustomers(token, this.customerSourceName).toPromise() as CustomerMap<'Altcoinomy'>
    logger.debug(minted, 'Already minted');
    const toMint = await this.getTokensToDeliver(minted);
    logger.debug(toMint, 'Tokens to mint');

    // Subtract the 2 lists
    for (const address in toMint) {
      if (address in minted) {
        toMint[address].amount = toMint[address].amount.minus(minted[address].amount);

        if(toMint[address].amount.lte(0)) {
          delete toMint[address];
        }
      }
    }

    return toMint;
  }

  protected async getTokensToDeliver(minted: CustomerMap<'Altcoinomy'>): Promise<CustomerMap<'Altcoinomy'>> {
    const toDeliver: CustomerMap<'Altcoinomy'> = {};

    (await this.getApprovedCustomers(minted)).forEach(sub => {
      if (!(sub.address in toDeliver)) {
        toDeliver[sub.address] = { ...sub, payload: [], amount: new BigNumber(0) };
      }

      toDeliver[sub.address].amount = toDeliver[sub.address].amount.plus(sub.amount);
      toDeliver[sub.address].payload.push(sub.payload);
    });

    return toDeliver;
  }

  protected async getApprovedCustomers(minted: CustomerMap<'Altcoinomy'>): Promise<AltcoinomyCustomer[]> {
    const content = await this.pullLatest();
    const records: (Record)[] = parse(
      content,
      { columns: true }
    );
    
    let burnAddressTransactions;
    try {
      burnAddressTransactions = await this.omniExplorer.burnAddressTransactions();
      logger.debug("All Burn Address Transactions", burnAddressTransactions);
    } catch (e) {
      logger.error(e, 'Fetching data from Omni Explorer failed, aborting');
      throw(e);
    }

    const consumedForAddress: {[address: string]: BigNumber} = {};

    const processedSubscriptions: AltcoinomyCustomer[] = [];

    for(const record of records) {
      const deliveryAddress = record[COLUMN_TOKEN_DELIVERY_ADDRESS];
      const senderAddress = record[this.tokenSenderAddressColumnName];

      // Pull the latest status from the API
      try {
        const status = await this.altcoinomyApi.subscription(record[COLUMN_SUBSCRIPTION_ID]);

        if (status.status === 'subscription_onboarded') {
          record[COLUMN_KYC_STATUS] = 'sub_ONBO';
        }

        record[this.tokenAmountColumnName] = status.nb_token_to_deliver;
      } catch (e) {
        logger.warn({err: (e as AxiosError).message}, 'Fetching status from Altoinomy API failed, falling back to exports');
      }

      // Compute amount of tokens to deliver
      const userBurnTransactions = this.omniExplorer.filterBurnTransactionsForAddress(senderAddress, burnAddressTransactions);
      logger.debug("User's burn transactions", userBurnTransactions);
      const totalBurnedAmount = this.omniExplorer.sumAmounts(userBurnTransactions);
      logger.debug("User's burned amount", totalBurnedAmount.toString());

      const clearedAmount = record[this.tokenAmountColumnName];
      const alreadyConsumed = senderAddress in consumedForAddress ? consumedForAddress[senderAddress] : new BigNumber(0);
      const unconsumed = totalBurnedAmount.minus(alreadyConsumed);

      const amountToDeliver = BigNumber.min(unconsumed, clearedAmount);

      consumedForAddress[senderAddress] = alreadyConsumed.plus(amountToDeliver);

      if (record[COLUMN_KYC_STATUS] === 'sub_ONBO' && amountToDeliver.gt(0)) {
        const subscription: AltcoinomyCustomer = {
          origin: 'Altcoinomy',
          amount: amountToDeliver,
          address: deliveryAddress,
          payload: {
            subscriptionId: record[COLUMN_SUBSCRIPTION_ID],
            username: record[COLUMN_USERNAME],
            email: record[COLUMN_EMAIL],
            referral: record[COLUMN_REFERRAL],
            senderAddress,
          }
        }
        
        processedSubscriptions.push(subscription);
      }
    }

    logger.debug("Final processed subscriptions", processedSubscriptions.map(s => {
      return {...s, amount: s.amount.toString()};
    }));
    return processedSubscriptions;
  }

  protected async pullLatest(): Promise<string> {
    await this.sftpClient.connect({
      host: this.sftpHost,
      username: this.sftpUser,
      privateKey: await fs.readFile(this.sftpKeyFile),
      passphrase: this.sftpKeyPassword,
    });

    // Get snapshots sorted in descending order by date
    const files = (await this.sftpClient.list(this.remoteCsvDir, `${this.sftpFilePrefix}_*`))
      .sort((a, b) => b.name.localeCompare(a.name));

    if(files.length < 1) {
      await this.sftpClient.end();
      return '';
    }

    const latestFileName = files[0].name;

    logger.debug(`Pulling '${latestFileName}' from Altcoinomy`);

    // Pull encrypted file contents
    const chiphertext = await this.sftpClient.get(`${this.remoteCsvDir}/${latestFileName}`);
    await this.sftpClient.end();

    // Decrypt message with PGP
    const pgpPrivateKeyArmored = await fs.readFile(this.pgpKeyFile);
    const { keys: [privateKey] } = await openpgp.key.readArmored(pgpPrivateKeyArmored);
    await privateKey.decrypt(this.pgpKeyPassword);

    const { data: decrypted } = await openpgp.decrypt({
      message: await openpgp.message.readArmored(chiphertext),
      privateKeys: [privateKey],
    });

    return decrypted;
  }
}