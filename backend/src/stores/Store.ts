import { Observable, from, of } from "rxjs";
import { auditTime, concatMap, startWith, take } from "rxjs/operators";
import { EventLogger } from "services/EventLogger";

export abstract class Store {
  public abstract init(): Promise<void>;

  constructor(protected readonly eventLogger: EventLogger) {}
}