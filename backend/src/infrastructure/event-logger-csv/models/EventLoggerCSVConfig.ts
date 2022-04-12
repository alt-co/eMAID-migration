import { InjectionToken } from "injection-js";
import { SupportedToken } from "models/SupportedTokens";

export const LogPath = new InjectionToken<(t: SupportedToken) => string>('LogPath');