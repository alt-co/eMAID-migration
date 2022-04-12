import { logger } from "util/logger";

import { SupportedToken, SupportedTokens, Token } from "models/SupportedTokens";
import { SupplyController } from "services/SupplyController";
import { CustomerSource } from "services/CustomerSource";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";
import { EventLogger } from "services/EventLogger";
import { TokenMintingRequested } from "models/events/TokenMintingRequested";
import BigNumber from "bignumber.js";

import { Inject } from "injection-js";
import { MintingThreshold } from "./models/MintFlowConfig";
import { OvermintProtector } from "./OvermintProtector";

export abstract class MintFlow<T extends SupportedToken, O extends SupportedCustomerOrigin> {
  public abstract readonly tokenSymbol: T;

  constructor(
    public readonly customerDataSource: CustomerSource<O> | CustomerSource<O>[],
    protected readonly supplyController: SupplyController,
    protected readonly eventLogger: EventLogger,
    @Inject(MintingThreshold) readonly mintingThreshold: string,
    @Inject(OvermintProtector) readonly overmintProtector: OvermintProtector<T, O>,
  ) {}

  public async execute(dryRun: boolean, origin?: SupportedCustomerOrigin): Promise<void> {
    logger.info(`Starting ${this.tokenSymbol} Minting process`);
    if (dryRun) {
      logger.warn('Transaction will NOT be written');
    }

    const customerSources = Array.isArray(this.customerDataSource)
      ? this.customerDataSource
      : [ this.customerDataSource ];

    for (const source of customerSources) {
      if (origin && origin !== source.customerSourceName) {
        continue;
      }

      logger.info(`Using source ${source.customerSourceName}`);

      await this.executeForSource(source, dryRun);
    }
  }

  protected async executeForSource(customerSource: CustomerSource<O>, dryRun: boolean): Promise<void> {
    const toMint = await customerSource.getAddressesToMint(this.tokenSymbol);

    if(Object.keys(toMint).length === 0) {
      logger.info('No new tokens to mint');
      return;
    }
    logger.info(toMint, `Minting tokens to ${Object.keys(toMint).length} recipients`);

    // Global Overmint protection
    try {
      await this.overmintProtector.checkForOvermint(toMint, customerSource);
    } catch (e) {
      logger.error(e);
      return;
    }    

    // Execute minting
    for (const address in toMint) {
      const recipient = toMint[address];

      if (recipient.amount.eq('0')) {
        logger.debug(recipient, `Skipping recipient with 0 amount`);
        continue;
      }
      if (recipient.amount.lt(new BigNumber(this.mintingThreshold))) {
        logger.info(recipient, `Skipping recipient below threshold`);
        continue;
      }

      if(dryRun) {
        const logEntry = {
          currency: this.tokenSymbol,
          customer: recipient,
          supplyControllerTransaction: {}
        };
        logger.info(logEntry, 'Proposed Mint');
      } else {
        const supplyControllerTransaction = await this.supplyController.proposeMint(recipient.address, recipient.amount);
        const logEntry = {
          currency: this.tokenSymbol,
          customer: recipient,
          supplyControllerTransaction,
        };
        await this.eventLogger.emit(TokenMintingRequested, logEntry as any);
      }
    }

    logger.info('Token minting requested');
  }
}