import BigNumber from "bignumber.js";
import { SupportedCustomerOrigin } from "./SupportedCustomerOrigins";

export interface Customer<O extends SupportedCustomerOrigin> {
  origin: O;
  amount: BigNumber;
  address: string;
  payload: unknown;
}

export type CustomerMap<O extends SupportedCustomerOrigin> = {
  [address: string]: Customer<O> & { payload: any[] };
};