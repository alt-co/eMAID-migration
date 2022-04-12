import BigNumber from "bignumber.js";
import { EventLogEntry } from "models/events/EventLogEntry";
import { SupportedToken } from "models/SupportedTokens";

export type Payload = {
  currency: SupportedToken,
  amount: BigNumber,
  blockNumber: number,
  transactionHash: string,
  user: any,
  mintRequestTimestamp: number
}

export class TokenMintingCompleted extends EventLogEntry<Payload, 'TokenMintingCompleted'> {
  public readonly type = 'TokenMintingCompleted';
}
