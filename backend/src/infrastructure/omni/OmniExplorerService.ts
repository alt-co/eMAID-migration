import Axios, { AxiosInstance } from "axios";
import { Injectable, Inject } from "injection-js";
import { OmniBurnAddress, OmniExplorerApiUrl, OmniRequiredConfirmations, OmniTokenPropertyId } from "./models/OmniExplorerConfig";
import { OmniExplorerTransaction } from "./models/OmniExplorerTransaction";

import BigNumber from "bignumber.js";
import { setDelay } from "util/delay";

@Injectable()
export class OmniExplorerService {
  private readonly api: AxiosInstance;

  constructor(
    @Inject(OmniExplorerApiUrl) readonly apiUrl: string,
    @Inject(OmniRequiredConfirmations) readonly requiredConfirmations: string,
    @Inject(OmniTokenPropertyId) readonly tokenPropertyId: string,
    @Inject(OmniBurnAddress) readonly burnAddress: string,
    ) {
        this.api = Axios.create({
            baseURL: apiUrl,
            timeout: 120000,
        });
    }

    public async burnAddressBalance(): Promise<BigNumber> {
        return this.addressBalance(this.burnAddress);
    }

    public async addressBalance(address: string): Promise<BigNumber> {
        const data = `addr=${address}`;

        try {
            const response = (await this.api.post('/v2/address/addr/', data));
            const balances: {id: string, value: string}[] = response.data[address].balance;

            for(let i=0; i<balances.length; i++) {
                if (new BigNumber(balances[i].id).isEqualTo(this.tokenPropertyId)) {
                    return new BigNumber(balances[i].value);
                }
            }

            return new BigNumber(0);
        } catch(error) {
            console.log(error);
            throw error;
        }
    }

    public sumAmounts(transactions: OmniExplorerTransaction[]) {
        let total = new BigNumber(0);
            
        for (let tx of transactions) {
            const amount = new BigNumber(tx.amount);
            total = total.plus(amount);
        }

        return total;
    }

    public filterBurnTransactionsForAddress(sendingAddress: string, transactions: OmniExplorerTransaction[]) {
        return transactions.filter(t => {
            return t.confirmations >= parseInt(this.requiredConfirmations) &&
                new BigNumber(t.propertyid).isEqualTo(this.tokenPropertyId) && 
                t.sendingaddress.trim().toLowerCase() === sendingAddress.trim().toLowerCase();
        });
    }

    public async burnAddressTransactions() {
        return this.transactions(this.burnAddress);
    }

    public async transactions(address: string): Promise<OmniExplorerTransaction[]> {
        let transactions = [];
        const firstPage = await this.transactionsForPage(address, 0);

        transactions = firstPage.transactions;

        for (let i=2; i<=firstPage.pages; i++) {
            await setDelay(6000); // Rate Limiting
            const page = await this.transactionsForPage(address, i);
            transactions = transactions.concat(page.transactions);
        }

        // Sanity check
        if (transactions.length !== firstPage.txcount) {
            throw new Error(`Expected ${firstPage.txcount} transactions, but got ${transactions.length}. Probably new transaction detected while fetching pages. Please rerun`);
        }

        return transactions;
    }

    public async transactionsForPage(address: string, page = 0): Promise<{address: string, pages: number, transactions: OmniExplorerTransaction[], txcount: number}> {
        const data = `addr=${address}&page=${page}`;

        try {
            const response = (await this.api.post('v1/transaction/address', data));
            return response.data;
        } catch(error) {
            console.log(error);
            throw error;
        }
    }
}