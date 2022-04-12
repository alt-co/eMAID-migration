import { Provider } from "injection-js";
import { EnvSource, getEnvVar } from "util/env-source";
import { ApiUrl, ApiToken } from "./models/PanicStatusConifig"

export const PanicStatusSetup: Provider[] = [
  { provide: ApiUrl, useFactory: getEnvVar('PANIC_API_URL', true), deps: [ EnvSource ] },
  { provide: ApiToken, useFactory: getEnvVar('PANIC_API_TOKEN', true), deps: [ EnvSource ] },
];
