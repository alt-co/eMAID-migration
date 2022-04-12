import { InjectionToken } from "injection-js";

export const AccessKeyId = new InjectionToken<string>('AWS_ACCESS_KEY_ID');
export const SecretAccessKey = new InjectionToken<string>('AWS_SECRET_ACCESS_KEY');
export const Region = new InjectionToken<string>('AWS_REGION');