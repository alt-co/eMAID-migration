import BigNumber from "bignumber.js";
import { Injectable } from "injection-js";
import { SupportedToken } from "models/SupportedTokens";
import { PricingService } from "services/PricingService";

@Injectable()
export class VirtualPricingService extends PricingService {
  public async getUSDPrice(amount: BigNumber | string | number, _: SupportedToken) {
    return new BigNumber(10000).multipliedBy(amount);
  }
}

export function buildPricingService(value: string) {
  return class VirtualPricingService extends PricingService {
    public async getUSDPrice(amount: BigNumber | string | number, _: SupportedToken) {
      return new BigNumber(value).multipliedBy(amount);
    }
  }
}