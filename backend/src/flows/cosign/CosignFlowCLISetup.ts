import { SafeAddress, TokenNetwork } from "infrastructure/gnosis-safe/models/GnosisSafeConfig";
import { Provider } from "injection-js";
import { EnvSource, getEnvVar } from "../../util/env-source";
import { CosignDelayInHours, OpenzeppelinRelayerApiKey, OpenzeppelinRelayerApiSecret } from "./models/CosignFlowConfig";


export const CosignFlowCLISetup: Provider[] = [
  { provide: CosignDelayInHours, useFactory: getEnvVar('COSIGN_DELAY_IN_HOURS'), deps: [ EnvSource ] },
  { provide: TokenNetwork, useFactory: getEnvVar('TOKEN_NETWORK'), deps: [ EnvSource ] },
  { provide: SafeAddress, useFactory: getEnvVar('SAFE_ADDRESS'), deps: [ EnvSource ] },
  { provide: OpenzeppelinRelayerApiKey, useFactory: getEnvVar('OPENZEPPELIN_RELAYER_API_KEY'), deps: [ EnvSource ] },
  { provide: OpenzeppelinRelayerApiSecret, useFactory: getEnvVar('OPENZEPPELIN_RELAYER_API_SECRET'), deps: [ EnvSource ] },
];