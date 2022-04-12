import { Provider } from "injection-js";
import { EnvSource, getEnvVar } from "../../util/env-source";
import { EventLogger } from "services/EventLogger";
import { EventLoggerCSV } from "infrastructure/event-logger-csv/EventLoggerCSV";
import { EventLoggerCSVSetup } from "infrastructure/event-logger-csv/EventLoggerCSVCLISetup";
import { InfuraApiKey, ZapierApiUrl } from './models/TokenEventListenerConfig';
import { SupportedTokens, SupportedTokensProdValues } from "models/SupportedTokens";
import { MintCompletedStore } from "stores/MintCompletedStore";

export const TokenEventListenerSetup: Provider[] = [
  { provide: SupportedTokens, useValue: SupportedTokensProdValues },
  { provide: InfuraApiKey, useFactory: getEnvVar('INFURA_API_KEY'), deps: [ EnvSource ] },
  { provide: ZapierApiUrl, useFactory: getEnvVar('ZAPIER_URL_MINT_COMPLETED'), deps: [ EnvSource ] },
  EventLoggerCSVSetup,
  { provide: EventLogger, useClass: EventLoggerCSV },
  MintCompletedStore,
];