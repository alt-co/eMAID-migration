import { SupportedToken } from "models/SupportedTokens";

export type TokenAllowedSwaps = Partial<{
  [token in SupportedToken]: { inputSource: string, outputDestination: string, name: string }[];
}>;
