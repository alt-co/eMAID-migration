import BigNumber from "bignumber.js";
import { SupplyControllerTransaction } from "models/SupplyControllerTransaction";

export abstract class SupplyController {
  public abstract proposeMint(to: string, amount: BigNumber): Promise<SupplyControllerTransaction>;
}
