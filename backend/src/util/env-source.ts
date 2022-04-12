import * as env from 'env-var';
import { InjectionToken } from "injection-js";

export const EnvSource = new InjectionToken<typeof env>('EnvService');
export type EnvSource = typeof env;

export const getEnvVar = (varName: string, optional = false) => (envSource: EnvSource) => {
  const result = optional ? envSource.get(varName).asString() : envSource.get(varName).required().asString();

  return result;
}