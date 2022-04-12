import BigNumber from "bignumber.js";

export interface WithdrawalTransactioInfo {
  address: string,
  amount: BigNumber,
  orderId: string,
  transactionId: string,
  timestamp: number
}