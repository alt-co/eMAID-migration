import { Provider } from "injection-js";
import { EnvSource, getEnvVar } from "../../util/env-source";
import {
  TokenNetwork,
  SafeAddress,
  PrivateKey
} from "./models/GnosisSafeConfig";

export const GnosisSafeSetup: Provider[] = [
  { provide: TokenNetwork, useFactory: getEnvVar('TOKEN_NETWORK'), deps: [ EnvSource ] },
  { provide: SafeAddress, useFactory: getEnvVar('SAFE_ADDRESS'), deps: [ EnvSource ] },
  { provide: PrivateKey, useFactory: getEnvVar('SAFE_TX_SIGNER_PRIVATE_KEY'), deps: [ EnvSource ] },
];