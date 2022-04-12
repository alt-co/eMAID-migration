import { Customer } from 'models/Customer';
import { EventLogEntry } from 'models/events/EventLogEntry';
import { SupportedCustomerOrigin } from 'models/SupportedCustomerOrigins';

export type Payload = {
  requestId: number,
  approvalReference: string,
  customer: Customer<SupportedCustomerOrigin>,
  supplyControllerTransaction: {
    data: string,
    nonce: number,
  },
}

export class TokenMintingApproved extends EventLogEntry<Payload, 'TokenMintingApproved'> {
  public readonly type = 'TokenMintingApproved';
}
