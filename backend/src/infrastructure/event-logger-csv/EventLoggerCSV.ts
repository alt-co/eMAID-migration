import { Observable, Subject } from "rxjs";
import { defaultIfEmpty, map } from "rxjs/operators";
import parse from "csv-parse";
import stringify from "csv-stringify/lib/sync";
import { Inject, Injectable } from "injection-js";
import { createReadStream, readFileSync, writeFileSync } from "fs";
import BigNumber from "bignumber.js";

import { AnyLogEntry, Uncommitted } from "models/events/EventLogEntry";
import { EventLogger } from "services/EventLogger";
import { logger } from "util/logger";
import { EventConstructor } from "models/Constructor";
import { streamToObservable } from "util/stream-to-rx";
import { LogPath } from "./models/EventLoggerCSVConfig";
import { SupportedToken, SupportedTokens } from "models/SupportedTokens";
import { Source } from "./models/LogPathResolver"
import { TokenMintingRequested } from "models/events/TokenMintingRequested";
import { AltcoinomyCustomer } from "infrastructure/altcoinomy/models/AltcoinomyCustomer";
import { TokenMintingCompleted } from "models/events/TokenMintingCompleted";

@Injectable()
export class EventLoggerCSV extends EventLogger {
  public readonly mintKeys = [ 'date', 'currency', 'origin', 'address', 'amount', 'data', 'nonce',
    'customer' ] as const;

  public readonly mintColumns = [ 'timestamp', 'currency', 'origin', 'eth_address', 'amount',
    'sc_call_data', 'gnosis_nonce', 'customer' ] as const;

  
  constructor(
    @Inject(LogPath) protected readonly logPath: (t: string) => string,
    @Inject(SupportedTokens) protected readonly supportedTokens: SupportedTokens,
  ) {
    super();
  }

  public async getLastEvent(source: Source): Promise<AnyLogEntry | null> {
    if (this.heads[source] === undefined) {
      const event = await this.getPastEvents(source).toPromise();
      this.heads[source] = event;
    }

    return this.heads[source];
  }

  protected getPastEvents(source: Source, pauser?: Subject<boolean>): Observable<AnyLogEntry | null> {
    if (source === undefined) {
      throw new Error('Source undefined');
    }

    const token = source.split('-')[0].toUpperCase() as SupportedToken;
    if (this.supportedTokens[token] === undefined) {
      throw new Error('Unknown token');
    }
    let columns: string[];
    if (source.includes('mint')) {
      columns = this.mintKeys as any;
    } else {
      throw new Error('Unhandled source');
    };

    const parser = parse({ columns, escape: '', quote: "'", fromLine: 2, relaxColumnCount: true });
    const logPath = this.logPath(source);
    const stream = createReadStream(logPath, { encoding: 'utf8', flags: 'a+' }).pipe(parser);

    return streamToObservable(stream, pauser).pipe(
      map((logEntry, i) => this.dispatchEvent(logEntry, i, source)),
      defaultIfEmpty(),
    );
  }

  protected dispatchEvent(logEntry: any, i: number, source: Source): AnyLogEntry {
    if (source.indexOf('mint-completed') >= 0) {
      return new TokenMintingCompleted(i, source, {
        ...JSON.parse(logEntry.data),
      });
    } else if (source.indexOf('mint') >= 0) {
      return new TokenMintingRequested(i, source, {
        currency: logEntry.currency,
        customer: {
          address: logEntry.address,
          amount: new BigNumber(logEntry.amount),
          origin: logEntry.origin,
          payload: JSON.parse(logEntry.customer),
        },
        supplyControllerTransaction: {
          data: logEntry.data,
          nonce: parseInt(logEntry.nonce, 10),
        }
      },
        logEntry.date,
      );
    } else {
      throw new Error('Unknown logEntry');
    }
  }

  protected async persistLog<T extends AnyLogEntry>(Ctor: EventConstructor<T>, event: Uncommitted<T>["payload"]): Promise<T> {
    const source: Source = this.getSource(Ctor, event);
    await this.getLastEvent(source);

    const lastEventId = this.getLatestEventId(source) || -1;
    const persistedEvent = new Ctor(lastEventId + 1, source, event);
    let log: string;
    let columns:
      'mintColumns';

    if(persistedEvent.type === 'TokenMintingRequested') {
      const tokenMintingRequestEvent = persistedEvent as TokenMintingRequested;
      const customer = tokenMintingRequestEvent.payload.customer as AltcoinomyCustomer;
      const supplyControllerTransaction = tokenMintingRequestEvent.payload.supplyControllerTransaction;
      columns = 'mintColumns';

      log = stringify([[
        tokenMintingRequestEvent.timestamp,
        tokenMintingRequestEvent.payload.currency,
        customer.origin,
        customer.address,
        customer.amount.toString(10),
        tokenMintingRequestEvent.payload.supplyControllerTransaction.data,
        supplyControllerTransaction.nonce || supplyControllerTransaction.id,
        JSON.stringify(customer.payload),
      ]], { quote: "'", escape: '' });
    } else {
      throw new Error('Unknown logEvent.type');
    }

    const logContents = readFileSync(this.logPath(source));
    // Append the header first
    if (!logContents.length) {
      logger.debug('Writing header');
      writeFileSync(this.logPath(source), this[columns].join(','), { flag: 'a' });
    }

    // Check for trailing newline
    if (logContents[logContents.length - 1] === '\n'.charCodeAt(0) || 
        logContents[logContents.length - 1] === '\r'.charCodeAt(0)) 
    {
      logger.warn(`Trailing newline detected at the end of ${this.logPath(source)}`);
      logger.debug(this.logPath(source), 'Writing log');
      writeFileSync(this.logPath(source), log.trim(), { flag: 'a' });
    } else {
      logger.debug(this.logPath(source), 'Writing log');
      writeFileSync(this.logPath(source), "\n" + log.trim(), { flag: 'a' });
    }

    return persistedEvent;
  }

  protected getSource<T extends AnyLogEntry>(Ctor: EventConstructor<T>, event: unknown): Source {
    if (this.isTokenMintingRequested<T>(event, Ctor)) {
      return event.currency.toLowerCase() + '-mint' as Source;
    } else {
      throw new Error('Unknown event destination' + Ctor.toString());
    }
  }

  protected isTokenMintingRequested<T extends AnyLogEntry>(
      event: Uncommitted<T>["payload"],
      Ctor: EventConstructor<T>,
  ): event is TokenMintingRequested['payload'] {
    return Ctor === TokenMintingRequested
      && this.supportedTokens[event.currency as SupportedToken] !== undefined;
  }
}