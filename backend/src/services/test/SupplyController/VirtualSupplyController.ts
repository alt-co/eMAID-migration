import BigNumber from "bignumber.js";
import { Injectable } from "injection-js";
import { SupplyControllerTransaction } from "models/SupplyControllerTransaction";
import { SupplyController } from "services/SupplyController";

@Injectable()
export class VirtualSupplyController extends SupplyController {
  public async proposeRebase(amount: BigNumber): Promise<SupplyControllerTransaction> {
    return { id: 'RebaseId', data: amount.toString() };
  }

  public async proposeMint(to: string, amount: BigNumber): Promise<SupplyControllerTransaction> {
    return { id: 'MintId', data: amount + ' -> ' + to };
  }

  public async proposeBurn(amount: BigNumber): Promise<SupplyControllerTransaction> {
    return { id: 'BurnId', data: amount.toString() };
  }

  public async proposeAddDownstreamTransaction(address: string, data: string): Promise<SupplyControllerTransaction> {
    return { id: 'AddDownstreamTransactionId', data: `${address}: ${data}` };
  }

  public async estimateRebaseNetworkFee() {
    return new BigNumber('0.001');
  }
}