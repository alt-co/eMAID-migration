import { logger } from "util/logger";

import { SupportedTokens } from "models/SupportedTokens";
import { CustomerSource } from "services/CustomerSource";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";
import BigNumber from "bignumber.js";

import { Inject, Injectable } from "injection-js";
import { TokenNetwork, StakedTokenAddress } from "infrastructure/gnosis-safe/models/GnosisSafeConfig";
import axios from "axios";
import { CustomerMap } from "models/Customer";
import { OvermintProtector } from "../OvermintProtector";
import { OmniExplorerService } from "infrastructure/omni/OmniExplorerService";

@Injectable()
export class MAIDOvermintProtector<O extends SupportedCustomerOrigin> extends OvermintProtector<'MAID', O> {
    public readonly tokenSymbol = 'MAID';

    constructor(
        @Inject(StakedTokenAddress) protected readonly tokenAddress: string,
        @Inject(TokenNetwork) protected readonly tokenNetwork: string, 
        @Inject(SupportedTokens) protected readonly supportedTokens: SupportedTokens,
        @Inject(OmniExplorerService) protected readonly omniExplorerService: OmniExplorerService,
    ) {
        super();
    }
    
    public async checkForOvermint(toMint: CustomerMap<O>, customerSource: CustomerSource<O>) {
        const maxPossibleSupply = await this.omniExplorerService.burnAddressBalance();
        logger.info(`Maximum allowed supply for "${this.tokenSymbol}": ${maxPossibleSupply.toString()}`);
    
        const etherscanApiUrls: { [network: string]: string; } = {
          'mainnet': 'https://api.etherscan.io/',
          'rinkeby': 'https://api-rinkeby.etherscan.io/',
        };
        const currentTotalSupply = new BigNumber((await axios.get(`${etherscanApiUrls[this.tokenNetwork]}/api?
          module=stats
          &action=tokensupply
          &contractaddress=${this.tokenAddress}`)
        ).data['result']).dividedBy(this.supportedTokens[this.tokenSymbol].stakedTokenDecimals);
        logger.info(`Current total supply from Etherscan: ${currentTotalSupply.toString()}`);
    
        let totalProposedMint = new BigNumber(0);
        for (const address in toMint) {
          const recipient = toMint[address];
          totalProposedMint = totalProposedMint.plus(recipient.amount);
        }
        logger.info(`Total proposed mint amount from "${customerSource.customerSourceName}": ${totalProposedMint.toString()}`);
    
        if (currentTotalSupply.plus(totalProposedMint).isGreaterThan(maxPossibleSupply)) {
          throw new Error("Proposed mint amount would exceed maximum allowed supply");
        }
      }
}