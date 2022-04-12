import { ethers, Contract, Event } from "ethers";
import { Inject, Injectable } from "injection-js";
import { 
  InfuraApiKey, 
  TokenAddress,
  ZapierApiUrl, 
} from './models/TokenEventListenerConfig';
import { EventLogger } from "services/EventLogger";
import { SupportedToken } from "models/SupportedTokens";
import { TokenMintingCompleted } from "models/events/TokenMintingCompleted";
import { MintCompletedStore } from "stores/MintCompletedStore";
import Axios, { AxiosInstance } from "axios";

@Injectable()
export class TokenEventListener {
  private api: AxiosInstance;
  private zeroAddress = '0x0000000000000000000000000000000000000000';
  private ABI = [
    "event Transfer(address indexed src, address indexed dst, uint val)"
  ];
  constructor(
    protected readonly eventLogger: EventLogger,
    protected readonly mintCompletedStore: MintCompletedStore,
    @Inject(TokenAddress) private tokenAddress: string,
    @Inject(InfuraApiKey) private readonly infuraApiKey: string,
    @Inject(ZapierApiUrl) private readonly zapierApiUrl: string,
  ) {
    this.api = Axios.create({
      baseURL: this.zapierApiUrl,
      timeout: 120000,
    });
  }

  public  async init() {};

  public async getMintEvents(
    token: SupportedToken,
    fromAddress: string = this.zeroAddress,
    fromBlock?: number,
  ) {
    const lastProcessedBlock = fromBlock || await this.mintCompletedStore.getLastProcessedBlock(token);
    if (!lastProcessedBlock) {
      throw new Error('Unable to get the initial block');
    }
    const lastBlockTransactions = await this.mintCompletedStore.getBlocksTransactions(token, lastProcessedBlock as number);
    const provider = new ethers.providers.InfuraProvider('homestead', this.infuraApiKey);
    const contract = new Contract(this.tokenAddress, this.ABI, provider);
    const logFilter = contract.filters.Transfer(fromAddress);
    const events: Event[] = await contract.queryFilter(logFilter, lastProcessedBlock);
    const notificationData = [];
    for await (const event of events) {
      if (
        !event || 
        !event.args ||
        !event.args[1]
      ) {
        continue;
      }
      
      if (lastBlockTransactions.includes(event.transactionHash)) {
        continue;
      }

      const userDetails = await this.mintCompletedStore.getMintAddressOwner(token, event.args[1] as string);
      if (
        !userDetails || 
        !userDetails[0] ||
        !userDetails[0].customer ||
        !userDetails[0].customer.payload
      ) {
        continue;
      }
      
      const mintRequestTimestamp = await this.mintCompletedStore.getMintRequestTimestamp(token, event.args[1] as string);
     
      if (
        !mintRequestTimestamp ||
        !mintRequestTimestamp[0]
      ) {
        continue;
      }

      const email = (userDetails[0].customer.payload as {email: string, username: string}).email;
      const username = (userDetails[0].customer.payload as {email: string, username: string}).username;

      const logEntry = {
        currency: token,
        amount: event.args[2].toString(),
        blockNumber: event.blockNumber,
        user: {email, name: username},
        transactionHash: event.transactionHash,
        mintRequestTimestamp: mintRequestTimestamp[0]
      };
      
      notificationData.push({ email, username, amount: event.args[2].toString()})
      await this.eventLogger.emit(TokenMintingCompleted, logEntry as any);
    }
    
    // Send info to Zapier 
    if (this.zapierApiUrl !== '' && notificationData.length > 0) {
      await this.api.post(
        '',
        notificationData
      )
    }

    return events;
  }
}
