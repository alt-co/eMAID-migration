import { Provider } from "injection-js";
import { LogPath } from "./models/EventLoggerCSVConfig";
import { logPathResolver } from "./models/LogPathResolver";

export const EventLoggerCSVSetup: Provider[] = [
  { provide: LogPath, useValue: logPathResolver },
];