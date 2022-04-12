import BigNumber from "bignumber.js";

export abstract class PricingService {
  public abstract getUSDPrice(amount: BigNumber | string | number, currencySymbol: string): Promise<BigNumber>
}