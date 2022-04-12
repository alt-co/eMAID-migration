import { Provider } from "injection-js";
import { EnvSource, getEnvVar } from "util/env-source";
import { OmniBurnAddress, OmniExplorerApiUrl, OmniRequiredConfirmations, OmniTokenPropertyId } from "./models/OmniExplorerConfig";


export const OmniExplorerCLISetup: Provider[] = [
  { provide: OmniExplorerApiUrl, useValue: 'https://api.omniexplorer.info/' },
  { provide: OmniRequiredConfirmations, useValue:  2 },
  { provide: OmniTokenPropertyId, useFactory: getEnvVar(`OMNI_TOKEN_PROPERTY_ID`), deps: [ EnvSource ]},
  { provide: OmniBurnAddress, useFactory: getEnvVar(`OMNI_TOKEN_BURN_ADDRESS`), deps: [ EnvSource ]}, 
];