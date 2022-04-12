import { expect } from "chai";
import { StakedTokenAddress, TokenNetwork } from "infrastructure/gnosis-safe/models/GnosisSafeConfig";
import { OmniBurnAddress, OmniTokenPropertyId } from "infrastructure/omni/models/OmniExplorerConfig";
import { ReflectiveInjector } from "injection-js";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";
import { CustomerSource } from "services/CustomerSource";
import { VirtualCustomerDataSource } from "services/test/CustomerDataSource/VirtualCustomerDataSource";
import { VirtualInfraStructure } from "services/test/VirtualInfrastructure/default";
import { substituteProviders } from "util/substituteProviders";
import { MintingThreshold } from "../models/MintFlowConfig";
import { MintMAIDSetup } from "./MintMAIDCLISetup";
import { MintMAIDFlow } from "./MintMAIDFlow";

describe('Mint MAID flow', function() {
  it('should instantiate a MintMAIDFlow', function () {
      const config = substituteProviders(
        [ MintMAIDSetup, MintMAIDFlow ],
        [
          ...VirtualInfraStructure,
          { provide: CustomerSource, useClass: VirtualCustomerDataSource, multi: true },
          { provide: MintingThreshold, useValue: '0' },
          { provide: StakedTokenAddress, useValue: '' },
          { provide: TokenNetwork, useValue: 'rinkeby' },
          { provide: OmniTokenPropertyId, useValue: '3' },
          { provide: OmniBurnAddress, useValue: '' },
        ]
      );

      const injector = ReflectiveInjector.resolveAndCreate(config);
      const mintFlow = injector.get(MintMAIDFlow) as MintMAIDFlow<SupportedCustomerOrigin>;

      expect(mintFlow).to.be.instanceOf(MintMAIDFlow);
      expect(mintFlow.tokenSymbol).to.equal('MAID');
  });
});