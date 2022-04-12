import Axios, { AxiosInstance } from "axios";
import BigNumber from "bignumber.js";
import { Injectable } from "injection-js";
import { PricingService } from "services/PricingService";

@Injectable()
export class CoinGeckoPricingService extends PricingService {
  protected api: AxiosInstance;
  protected currencyNameMap: { [currency: string]: string } = {
    'ETH': 'ethereum',
    'XEM': 'nem',
    'FIRO': 'zcoin',
    'ZEN': 'zencash',
    'DIVI': 'divi',
    'DOT': 'polkadot',
    'XYM': 'symbol',
    'MATIC': 'matic-network',
  };

  constructor() {
    super();
    this.api = Axios.create({
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 120000,
    });
  }

  public async getUSDPrice(amount: BigNumber | string | number, currencySymbol: string): Promise<BigNumber> {
    const currencyName = this.currencyNameMap[currencySymbol];
    const vsCurrency = 'usd';

    if (!currencyName) {
      throw new Error('Unsupported token');
    }
    const params = { vs_currencies: vsCurrency, ids: currencyName };
    const price = (await this.api.get('/simple/price', { params })).data[currencyName][vsCurrency];

    return new BigNumber(amount).multipliedBy(price);
  }
}