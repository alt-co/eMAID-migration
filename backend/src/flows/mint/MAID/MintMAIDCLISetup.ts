import { Provider } from "injection-js";
import { CustomerSource } from "services/CustomerSource";
import { SupplyController } from "services/SupplyController";
import { SftpFilePrefix, TokenAmountColumnName, TokenSenderAddressColumnName } from "infrastructure/altcoinomy/models/AltcoinomyConfig";
import { AltcoinomyCustomerDataSourceSFTP } from "infrastructure/altcoinomy/AltcoinomyCustomerDataSourceSFTP";
import { AltcoinomySetup } from "infrastructure/altcoinomy/AltcoinomyCLISetup";
import { SupportedTokens, SupportedTokensProdValues, Token } from "models/SupportedTokens";
import { StakedTokenAddress } from "infrastructure/gnosis-safe/models/GnosisSafeConfig";
import { EnvSource, getEnvVar } from "util/env-source";
import { CustomerStore } from "stores/CustomerStore";
import { MintStore } from "stores/MintStore";
import { GnosisSafeService } from "infrastructure/gnosis-safe/GnosisSafeService";
import { GnosisSafeSetup } from "infrastructure/gnosis-safe/GnosisSafeCLISetup";
import { MintingThreshold } from "../models/MintFlowConfig";
import { OvermintProtector } from "../OvermintProtector";
import { MAIDOvermintProtector } from "./MAIDOvermintProtector";

export const MintMAIDSetup: Provider[] = [
  AltcoinomySetup,
  { provide: CustomerSource, useClass: AltcoinomyCustomerDataSourceSFTP },
  { provide: SftpFilePrefix, useValue: 'export_safecoin' },
  { provide: TokenAmountColumnName, useValue: 'Investment - Crypto - MAID - Amount' },
  { provide: TokenSenderAddressColumnName, useValue: 'Investment - Crypto - MAID - Crypto Address' },
  { provide: SupportedTokens, useValue: SupportedTokensProdValues },
  { provide: StakedTokenAddress, useFactory: getEnvVar(`STAKED_TOKEN_ADDRESS_MAID`), deps: [ EnvSource ] },
  { provide: MintingThreshold, useFactory: getEnvVar(`MINTING_THRESHOLD_MAID`), deps: [ EnvSource ] },
  { provide: Token, useValue: 'MAID'},
  { provide: CustomerStore, useClass: MintStore},
  GnosisSafeSetup,
  {provide: SupplyController, useClass: GnosisSafeService},
  {provide: OvermintProtector, useClass: MAIDOvermintProtector}
];