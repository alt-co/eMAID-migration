import { ethers, providers, VoidSigner, Wallet } from "ethers";
import { Inject, Injectable } from "injection-js";
import { logger } from "util/logger";
import { PrivateKey, SafeAddress, StakedTokenAddress, TokenNetwork } from "./models/GnosisSafeConfig"
import { SupplyController } from "services/SupplyController";
import BigNumber from "bignumber.js";
import { MintablePausableToken } from "infrastructure/ethereum/MintablePausableToken";
import { SupportedToken, SupportedTokens, Token } from "models/SupportedTokens";
import { SupplyControllerTransaction } from "models/SupplyControllerTransaction";
import Safe, { EthersAdapter } from "@gnosis.pm/safe-core-sdk";
import SafeServiceClient from '@gnosis.pm/safe-service-client';

@Injectable()
export class GnosisSafeService extends SupplyController {
  protected readonly safeService: SafeServiceClient;
  protected readonly provider: providers.InfuraProvider;
  protected readonly signer: Wallet;

  constructor (
    @Inject(TokenNetwork) protected readonly safeNetwork: string,
    @Inject(SafeAddress) protected readonly safeAddress: string,
    @Inject(StakedTokenAddress) protected readonly tokenAddress: string,
    @Inject(PrivateKey) protected readonly privateKey: string,
    @Inject(Token) protected readonly token: SupportedToken,
    @Inject(SupportedTokens) protected readonly supportedTokens: SupportedTokens,
  ) {
    super();
    
    const txServiceUrls: {[network: string]: string} = {
      'mainnet': 'https://safe-transaction.gnosis.io',
      'rinkeby': 'https://safe-transaction.rinkeby.gnosis.io',
    };

    if (!(safeNetwork in txServiceUrls)) {
      throw new Error(`Gnosis Safe network "${safeNetwork}" not supported`);
    }

    this.safeService = new SafeServiceClient(txServiceUrls[safeNetwork]);
    this.provider = new providers.InfuraProvider(safeNetwork);
    this.signer = new Wallet(this.privateKey, this.provider);
  }

  public proposeMint(to: string, amount: BigNumber): Promise<SupplyControllerTransaction> {
    const subunitsAmount = this.toSubunits(amount)
    const data = MintablePausableToken.encodeMint(to, subunitsAmount);

    return this.proposeTx(data);
  }

  public async proposePause(): Promise<SupplyControllerTransaction> {
    const callData = MintablePausableToken.encodePause();
    return this.proposeTx(callData);
  }

  public async proposeUnpause(): Promise<SupplyControllerTransaction> {
    const callData = MintablePausableToken.encodeUnpause();
    return this.proposeTx(callData);
  }

  protected async proposeTx(data: string): Promise<SupplyControllerTransaction> {
    const safeSdk = await this.safeSdk();

    const nonce = await this.safeService.getNextNonce(this.safeAddress);

    const transactions = [{
      to: this.tokenAddress,
      value: '0',
      data: data,
      nonce,
    }]

    const safeTransaction = await safeSdk.createTransaction(transactions);
    await safeSdk.signTransaction(safeTransaction);
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
    const senderAddress = await new ethers.Wallet(this.privateKey).getAddress();

    logger.info(safeTransaction, "Proposing a transaction to Gnosis Safe");

    await this.safeService.proposeTransaction({
      safeAddress: this.safeAddress,
      safeTransaction,
      safeTxHash,
      senderAddress,
    })

    return {
      id: safeTxHash,
      data: safeTransaction.data.data,
    };
  }

  private safeSdk(): Promise<Safe> {
    const ethersAdapter = new EthersAdapter({
      ethers,
      signer: this.signer,
    });

    return Safe.create({ ethAdapter: ethersAdapter, safeAddress: this.safeAddress })
  }

  protected toSubunits(amount: BigNumber) {
    return amount.times(this.supportedTokens[this.token].stakedTokenDecimals);
  }
}