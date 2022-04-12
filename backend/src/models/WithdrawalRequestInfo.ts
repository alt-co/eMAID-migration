import BigNumber from "bignumber.js";

export interface WithdrawalRequestInfo {
  timestamp: number;
  customer: any;
  address: string;
  amount: BigNumber;
  origin: string;
}
