import { InjectionToken } from "injection-js";

export const ApiUrl = new InjectionToken<string>('ALTCOINOMY_API_URL');
export const Username = new InjectionToken<string>('ALTCOINOMY_USERNAME');
export const Password = new InjectionToken<string>('ALTCOINOMY_PASSWORD');
export const IcoIdMAID = new InjectionToken<string>('ALTCOINOMY_ICO_ID_MAID');
export const InputFilePath = new InjectionToken<string>('MintInputFilePath');
export const TokenAmountColumnName = new InjectionToken<string>('TokenAmountColumnName');
export const TokenSenderAddressColumnName = new InjectionToken<string>('TokenSenderAddressColumnName');


export const SftpHost = new InjectionToken<string>('SftpHost');
export const SftpUser = new InjectionToken<string>('SftpUser');
export const SftpKeyFile = new InjectionToken<string>('SftpKeyFile');
export const SftpKeyPassword = new InjectionToken<string>('SftpKeyPassword');
export const SftpFilePrefix = new InjectionToken<string>('SftpPathPrefix');

export const PGPKeyFile = new InjectionToken<string>('PGPKeyFile');
export const PGPKeyPassword = new InjectionToken<string>('PGPKeyPassword');
