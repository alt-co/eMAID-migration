import { CustomerMap } from "models/Customer";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";
import { SupportedToken } from "models/SupportedTokens";

export abstract class CustomerSource<O extends SupportedCustomerOrigin> {
  public readonly abstract customerSourceName: O;
  public abstract getAddressesToMint(token: SupportedToken): Promise<CustomerMap<O>>;
}