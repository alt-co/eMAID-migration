
import { Inject, Injectable } from "injection-js";

import { SupplyController } from "services/SupplyController";
import { CustomerSource } from "services/CustomerSource";
import { MintFlow } from "../MintFlow";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";
import { EventLogger } from "services/EventLogger";
import { MintingThreshold } from "../models/MintFlowConfig";
import { OvermintProtector } from "../OvermintProtector";

@Injectable()
export class MintMAIDFlow<O extends SupportedCustomerOrigin> extends MintFlow<'MAID', O> {
    public readonly tokenSymbol = 'MAID';

    constructor(
        public readonly customerDataSource: CustomerSource<O>,
        protected readonly supplyController: SupplyController,
        protected readonly eventLogger: EventLogger,
        @Inject(MintingThreshold) readonly mintingThreshold: string,
        @Inject(OvermintProtector) readonly overmintProtector: OvermintProtector<'MAID', O>,
    ) {
        super(customerDataSource, supplyController, eventLogger, mintingThreshold, overmintProtector);
    }
}