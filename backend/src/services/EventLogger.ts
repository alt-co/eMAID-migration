import { delayWhen, filter, finalize, skipWhile, takeWhile } from "rxjs/operators";
import { Subject, Observable, from, concat } from "rxjs"
import { EventConstructor } from "models/Constructor";
import { EventFilterConfig } from "models/EventFilterConfig";
import { EventLogEntry, AnyLogEntry, PauseableObservable, Uncommitted } from "models/events/EventLogEntry";

export abstract class EventLogger {
  protected readonly eventsSubject = new Subject<AnyLogEntry>();
  protected heads: { [source: string ]: AnyLogEntry | null } = {};

  public abstract getLastEvent(source: string): Promise<AnyLogEntry | null>;
  protected abstract persistLog<T extends EventLogEntry<any, string>>(Ctor: EventConstructor<T>, event: Uncommitted<T>["payload"]): Promise<T>;
  protected abstract getPastEvents(source: string, pauser?: Subject<boolean>): Observable<AnyLogEntry | null>;

  constructor() {}

  public getLatestEventId(source: string = ''): number | null {
    const head = this.heads[source];

    if (head === undefined) {
      throw new Error('Logger not ready');
    } else {
      return head?.id || null;
    }
  }

  public select<T extends AnyLogEntry>(config: EventFilterConfig = { source: '' }): PauseableObservable<T> {
    // TODO: Validate config
    const pauser = new Subject<boolean>();
    const pastEvents = this.getPastEvents(config.source, pauser);
    const source = pastEvents;
    const filtered = source.pipe(
      filter((e): e is AnyLogEntry => e !== null),
      skipWhile(e => config.start ? e.id < config.start : false),
      takeWhile(e => config.end ? e.id <= config.end : true),
      filter(e => config.filter ? config.filter(e) : true),
      finalize(() => pauser.complete()),
    );

    (filtered as any).pause = (state: boolean) => pauser.next(state);

    return filtered as PauseableObservable<T>;
  }

  public async emit<T extends AnyLogEntry>(type: EventConstructor<T>, event: T["payload"]): Promise<AnyLogEntry> {
    const committedEvent = await this.persistLog(type, event);
    this.heads[committedEvent.source] = committedEvent;
    this.eventsSubject.next(committedEvent);

    return committedEvent;
  }
}