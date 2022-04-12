import { Observable } from "rxjs";

export abstract class EventLogEntry<E, T extends string> {
  public abstract readonly type: T;

  public timestamp: number;

  constructor(
    public readonly id: number,
    public readonly source: string,
    public readonly payload: E,
    timestamp?: number,
  ) {
    this.timestamp = timestamp ? timestamp : new Date().getTime();
  }

  isCommitted(): boolean {
    return !!this.id;
  }
}

export type Uncommitted<E extends EventLogEntry<any, string>> = Omit<EventLogEntry<E["payload"], E["type"]>, 'id' | 'timestamp'>;

export type AnyLogEntry = EventLogEntry<any, string>;

export type PauseableObservable<T> = Observable<T> & { pause(state: boolean): void };