import { Injectable, InjectionToken } from 'injection-js';
import BigNumber from 'bignumber.js';
import { scan, filter, startWith } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';
import { EventFilterConfig } from 'models/EventFilterConfig';
import { EventLogger } from 'services/EventLogger';
import { SupportedToken } from 'models/SupportedTokens';
import { CustomerMap } from 'models/Customer';
import { SupportedCustomerOrigin } from 'models/SupportedCustomerOrigins';
import { TokenMintingRequested } from 'models/events/TokenMintingRequested';
import { Store } from './Store';
import { TokenAllowedSwaps } from 'models/TokenAllowedSwaps';

type AnyCustomerMap = CustomerMap<SupportedCustomerOrigin>;
type CustomerEvent = TokenMintingRequested;

export const CustomerEventType = new InjectionToken<string>('CustomerEventType');
export type UserDetailsType = {email: string, username: string};
@Injectable()
export abstract class CustomerStore extends Store {
  readonly abstract sourceSuffix: string;
  readonly abstract eventType: string;

  constructor(eventLogger: EventLogger) {
    super(eventLogger);
  }

  public async init() {}

  public async getLastProcessedFireblocksTransaction(
    token: SupportedToken,
    allowedSwaps: NonNullable<TokenAllowedSwaps[SupportedToken]>,
  ): Promise<{ [address: string]: number }> {
    const filterCfg: EventFilterConfig = {
      filter: ({ type }) => type === 'TokenMintingRequested',
      source: `${token.toLowerCase()}-mint`,
      start: 0,
    };

    return this.eventLogger.select<TokenMintingRequested>(filterCfg).pipe(
      filter(c => c.payload.customer.origin === 'Fireblocks'),
      scan((a, c) => {
        const input = allowedSwaps.find(s => s.outputDestination === c.payload.customer.address)?.inputSource;
        for (const txs of (c.payload.customer.payload as any).transactions) {
          const nonce = txs.createdAt;

          if (!nonce) {
            throw new Error('Missing Nonce');
          }

          if (!input) {
            throw new Error('Missing input source address');
          }

          if (!a[input]) {
            a[input] = nonce;
          } else if (a[input] < nonce) {
            a[input] = nonce;
          }
        }

        return a;
      }, {} as { [address: string]: number }),
      startWith({}),
    ).toPromise();
  }

  public tokenCustomers(token: SupportedToken, origin?: SupportedCustomerOrigin): Observable<AnyCustomerMap> {
    const filterCfg: EventFilterConfig = {
      filter: ({ type }) => type === this.eventType,
      source: `${token.toLowerCase()}-${this.sourceSuffix}`,
      start: 0,
    };

    return this.eventLogger.select<CustomerEvent>(filterCfg).pipe(
      filter(c => origin ? c.payload.customer.origin === origin : true),
      scan((a, c) => this.collectCustomers(a, c), {} as CustomerMap<SupportedCustomerOrigin>),
      startWith({}),
    );
  }

  public async getLastProcessedDCGTransaction(
    token: SupportedToken,
    allowedSwaps: NonNullable<TokenAllowedSwaps[SupportedToken]>,
  ): Promise<{ [address: string]: string }> {
    const filterCfg: EventFilterConfig = {
      filter: ({ type }) => type === 'TokenMintingRequested',
      source: `${token.toLowerCase()}-mint`,
      start: 0,
    };

    return this.eventLogger.select<TokenMintingRequested>(filterCfg).pipe(
      filter(c => c.payload.customer.origin === 'DCG'),
      scan((a, c) => {
        const input = allowedSwaps.find(s => s.outputDestination === c.payload.customer.address)?.inputSource;

        if (input) {
          const maxOrderId = (c.payload.customer.payload as Array<any>).reduce((acc, tx) => {
            return tx.orderId > acc ? tx.orderId : acc;
          }, '');

          a[input] = maxOrderId;
        }

        return a;
      }, {} as { [address: string]: string }),
      startWith({}),
    ).toPromise() as any;
  }

  public getAllEvents(
    token: SupportedToken,
  ) {
    const filterCfg: EventFilterConfig = {
      filter: ({ type }) => type === this.eventType,
      source: `${token.toLowerCase()}-${this.sourceSuffix}`,
      start: 0,
    };

    return this.eventLogger.select<CustomerEvent>(filterCfg);
  }

  protected collectCustomers(minted: CustomerMap<SupportedCustomerOrigin>, event: CustomerEvent) {
    const { customer: { address, amount, origin } } = event.payload;

    if (!minted[address]) {
      minted[address] = {
        origin,
        amount: new BigNumber(0),
        address,
        payload: [],
      };
    }

    minted[address].amount = minted[address].amount.plus(amount);
    minted[address].payload.push(event.payload);

    return minted;
  }
}