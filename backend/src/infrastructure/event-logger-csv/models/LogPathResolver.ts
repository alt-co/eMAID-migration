import { SupportedToken } from "models/SupportedTokens";

type Operation = 'mint' | 'rewards' | 'stake' | 'collateral-deposit' | 'mint-completed';
type Token = SupportedToken;

export type Source = `${Lowercase<Token>}-${Operation}`;
export const logPathResolver = (source: Source) => `./state_logs/${source}-log.csv`;
export type LogPathResolver = typeof logPathResolver;