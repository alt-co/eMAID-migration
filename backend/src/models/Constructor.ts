import { AnyLogEntry } from "./events/EventLogEntry";

export type EventConstructor<T extends AnyLogEntry> = {
  new(id: number, source: string, payload: T["payload"]): T
}