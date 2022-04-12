import { Inject, Injectable, InjectionToken } from "injection-js";
import { Observable, from, of } from "rxjs";

import { AnyLogEntry, EventLogEntry, Uncommitted } from "models/events/EventLogEntry";
import { EventLogger } from "services/EventLogger";
import { EventConstructor } from "models/Constructor";

export const PastEvents = new InjectionToken('PastEvents');

export class VirtualLogEntry extends EventLogEntry<number, 'VirtualLogEntry'> {
  public readonly type = 'VirtualLogEntry';
}

@Injectable()
export class VirtualEventLogger extends EventLogger {
  constructor(@Inject(PastEvents) protected events: VirtualLogEntry[] = []) {
    super();
  }

  public async getLastEvent(source: string = ''): Promise<VirtualLogEntry | null> {
    const head = this.events[this.events.length - 1] || null;
    this.heads[source] = head;

    return head;
  }

  protected getPastEvents(): Observable<VirtualLogEntry | null> {
    return this.events.length ? from(this.events) : of(null);
  }

  protected async persistLog<T extends AnyLogEntry>(Ctor: EventConstructor<T>, event: Uncommitted<T>["payload"]): Promise<T> {
    const id = this.events.length;

    const persistedEvent = new Ctor(id, '', event);
    this.events.push(persistedEvent as VirtualLogEntry);
    this.heads[''] = persistedEvent

    return persistedEvent;
  }
}
