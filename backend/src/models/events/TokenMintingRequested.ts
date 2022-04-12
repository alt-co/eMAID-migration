import { Customer } from "models/Customer";
import { EventLogEntry } from "models/events/EventLogEntry";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";
import { SupportedToken } from "models/SupportedTokens";

export type Payload = {
  currency: SupportedToken,
  customer: Customer<SupportedCustomerOrigin>,
  supplyControllerTransaction: {
    data: string,
    nonce?: number,
    id?: number,
  },
}

export class TokenMintingRequested extends EventLogEntry<Payload, 'TokenMintingRequested'> {
  public readonly type = 'TokenMintingRequested';
}
