import { Injectable } from "injection-js";
import { CustomerMap } from "models/Customer";
import { SupportedToken } from "models/SupportedTokens";
import { CustomerSource } from "services/CustomerSource";

@Injectable()
export class VirtualCustomerDataSource extends CustomerSource<'Altcoinomy'> {
  public readonly customerSourceName = 'Altcoinomy';

  public async getAddressesToMint(_: SupportedToken): Promise<CustomerMap<'Altcoinomy'>> {
    return {};
  }
}