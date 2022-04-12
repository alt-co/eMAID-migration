import { Provider } from "injection-js";
import { EnvSource, getEnvVar } from "util/env-source";
import { AccessKeyId, SecretAccessKey, Region } from "./models/AWSSecretsConfig";

export const AWSS3Setup: Provider[] = [
  { provide: AccessKeyId, useFactory: getEnvVar('AWS_ACCESS_KEY_ID'), deps: [ EnvSource ] },
  { provide: SecretAccessKey, useFactory: getEnvVar('AWS_SECRET_ACCESS_KEY'), deps: [ EnvSource ] },
  { provide: Region, useFactory: getEnvVar('AWS_REGION'), deps: [ EnvSource ] },
];