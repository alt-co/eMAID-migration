import { InjectionToken } from "injection-js";

export const TokenNetwork = new InjectionToken<string>('TOKEN_NETWORK');
export const StakedTokenAddress = new InjectionToken<string>('STAKED_TOKEN_ADDRESS');
export const SafeAddress = new InjectionToken<string>('SAFE_ADDRESS');
export const PrivateKey = new InjectionToken<string>('SAFE_TX_SIGNER_PRIVATE_KEY');