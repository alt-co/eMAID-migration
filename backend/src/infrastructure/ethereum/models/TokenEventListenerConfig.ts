import { InjectionToken } from "injection-js";

export const InfuraApiKey = new InjectionToken<string>('INFURA_API_KEY');

export const TokenAddress = new InjectionToken<string>('TOKEN_ADDRESS');

export const ZapierApiUrl = new InjectionToken<string>('ZAPIER_API_URL');