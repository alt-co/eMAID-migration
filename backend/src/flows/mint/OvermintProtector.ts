import { SupportedToken } from "models/SupportedTokens";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";
import { CustomerMap } from "models/Customer";
import { CustomerSource } from "services/CustomerSource";

export abstract class OvermintProtector<T extends SupportedToken, O extends SupportedCustomerOrigin> {
  public abstract readonly tokenSymbol: T;

  constructor() {}
  
  public abstract checkForOvermint(toMint: CustomerMap<O>, customerSource: CustomerSource<O>): Promise<void>;
}