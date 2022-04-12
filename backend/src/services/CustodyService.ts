import BigNumber from "bignumber.js";
import { SupportedCustodian } from "models/SupportedCustodians";
import { SupportedToken } from "models/SupportedTokens";

export abstract class CustodyService<T extends SupportedToken, C extends SupportedCustodian> {
  public abstract readonly custodianName: C;
  public abstract readonly custodyMonthlyCost: { [token in T]: BigNumber };
  public abstract getBalance(token: T, ...params: any[]): Promise<BigNumber>;
}