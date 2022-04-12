import { Provider } from "injection-js";
import { ApiUrl, Username, Password, IcoIdMAID, SftpHost, SftpUser, SftpKeyFile, SftpKeyPassword, PGPKeyFile, PGPKeyPassword } from "./models/AltcoinomyConfig";
import { EnvSource, getEnvVar } from "../../util/env-source";
import { EventLogger } from "services/EventLogger";
import { EventLoggerCSV } from "infrastructure/event-logger-csv/EventLoggerCSV";
import { EventLoggerCSVSetup } from "infrastructure/event-logger-csv/EventLoggerCSVCLISetup";
import { AltcoinomyService } from "./AltcoinomyService";
import { OmniExplorerService } from "infrastructure/omni/OmniExplorerService";
import { OmniExplorerCLISetup } from "infrastructure/omni/OmniExplorerCLISetup";


export const AltcoinomySetup: Provider[] = [
  { provide: ApiUrl, useFactory: getEnvVar('ALTCOINOMY_API_URL'), deps: [ EnvSource ]},
  { provide: Username, useFactory: getEnvVar('ALTCOINOMY_USERNAME'), deps: [ EnvSource ] },
  { provide: Password, useFactory: getEnvVar('ALTCOINOMY_PASSWORD'), deps: [ EnvSource ] },
  { provide: IcoIdMAID, useFactory: getEnvVar('ALTCOINOMY_ICO_ID_MAID'), deps: [ EnvSource ] },
  { provide: SftpHost, useFactory: getEnvVar('ALTCOINOMY_SFTP_HOST'), deps: [ EnvSource ] },
  { provide: SftpUser, useFactory: getEnvVar('ALTCOINOMY_SFTP_USER'), deps: [ EnvSource ] },
  { provide: SftpKeyFile, useFactory: getEnvVar('ALTCOINOMY_SFTP_KEY_FILE'), deps: [ EnvSource ] },
  { provide: SftpKeyPassword, useFactory: getEnvVar('ALTCOINOMY_SFTP_KEY_PASSWORD'), deps: [ EnvSource ] },
  { provide: PGPKeyFile, useFactory: getEnvVar('PGP_KEY_FILE'), deps: [ EnvSource ] },
  { provide: PGPKeyPassword, useFactory: getEnvVar('PGP_KEY_PASSWORD'), deps: [ EnvSource ] },
  EventLoggerCSVSetup,
  { provide: EventLogger, useClass: EventLoggerCSV },
  AltcoinomyService,
  OmniExplorerCLISetup,
  OmniExplorerService,
];