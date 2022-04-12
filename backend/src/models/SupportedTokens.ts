import BigNumber from "bignumber.js";
import { InjectionToken } from "injection-js";
import { SupportedCustodianNames } from "models/SupportedCustodians";

export const SupportedTokensProdValues = {
  'MAID': {
    stakedTokenDecimals: new BigNumber(10).pow(18),
  },
} as const;

export const SupportedTokens = new InjectionToken<typeof SupportedTokensProdValues>('SupportedTokens');
export type SupportedTokens = typeof SupportedTokensProdValues;

export type SupportedToken = keyof typeof SupportedTokensProdValues;

export const Token = new InjectionToken<string>('Token');