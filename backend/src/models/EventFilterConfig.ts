import { AnyLogEntry } from "./events/EventLogEntry";

export interface EventFilterConfig {
  source: string,
  start?: number;
  end?: number;
  filter?: (event: AnyLogEntry) => boolean;
}
