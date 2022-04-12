import { Injectable } from 'injection-js';
import { EventLogger } from 'services/EventLogger';
import { Store } from './Store';
import { SupportedToken } from 'models/SupportedTokens';
import { EventFilterConfig } from 'models/EventFilterConfig';
import { TokenMintingCompleted } from "models/events/TokenMintingCompleted";
import { scan, map, filter, startWith } from 'rxjs/operators';
import { TokenMintingRequested } from 'models/events/TokenMintingRequested';

@Injectable()
export class MintCompletedStore extends Store  {
  sourceSuffix = 'mint-completed';
  eventType = 'TokenMintingCompleted';

  constructor(eventLogger: EventLogger) {
    super(eventLogger);
  }

  public async init() {}

  public async getLastEvent(
    token: SupportedToken
  ) {
    const filterCfg: EventFilterConfig = {
      filter: e => e.type === this.eventType,
      source: `${token}-mint-completed`,
      start: 0,
    };

    return await this.eventLogger.select<TokenMintingCompleted>(filterCfg).pipe(
      scan((a, c) => a.concat(c.payload), [] as TokenMintingCompleted['payload'][]),
      startWith([]),
    ).toPromise();
  }

  public async getLastProcessedBlock(
    token: SupportedToken
  ): Promise<number> {
    const filterCfg: EventFilterConfig = {
      filter: e => e.type === this.eventType,
      source: `${token}-mint-completed`,
      start: 0,
    };

    return await this.eventLogger.select<TokenMintingCompleted>(filterCfg).pipe(
      map(c => Number(c.payload.blockNumber)),
      scan((a, c) => a.concat(c), [] as number[]),
      map(a => Math.max(...a)),
      startWith(0),
    ).toPromise();
  }

  public async getBlocksTransactions(
    token: SupportedToken,
    blockNumber: number
  ): Promise<string[]> {
    const filterCfg: EventFilterConfig = {
      filter: e => e.type === this.eventType,
      source: `${token}-mint-completed`,
      start: 0,
    };

    return await this.eventLogger.select<TokenMintingCompleted>(filterCfg).pipe(
      filter(c => c.payload.blockNumber === blockNumber),
      map(c => c.payload.transactionHash),
      scan((a, c) => a.concat(c), [] as string[]),
      startWith([]),
    ).toPromise();
  }

  public async getMintAddressOwner(
    token: SupportedToken,
    address: string
  ): Promise<TokenMintingRequested['payload'][]> {
    const filterCfg: EventFilterConfig = {
      filter: ({ type }) => type === 'TokenMintingRequested',
      source: `${token}-mint`,
      start: 0,
    };

    return await this.eventLogger.select<TokenMintingRequested>(filterCfg).pipe(
      filter(c => c.payload.customer.address.toLowerCase() === address.toLowerCase()),
      scan((a, c) => a.concat(c.payload), [] as TokenMintingRequested['payload'][]),
      startWith([]),
    ).toPromise();
  }

  public async getMintRequestTimestamp(
    token: SupportedToken,
    address: string
  ): Promise<Number[]> {
    const filterCfg: EventFilterConfig = {
      filter: ({ type }) => type === 'TokenMintingRequested',
      source: `${token}-mint`,
      start: 0,
    };

    return await this.eventLogger.select<TokenMintingRequested>(filterCfg).pipe(
      filter(c => c.payload.customer.address.toLowerCase() === address.toLowerCase()),
      scan((a, c) => a.concat([c.timestamp]), [] as number[]),
      startWith([]),
    ).toPromise();
  }

}