
export const SupportedCustodians = [ 'Copper', 'Fireblocks', 'Coincover' ] as const;
export type SupportedCustodian = typeof SupportedCustodians[number];
export enum SupportedCustodianNames  {
  COPPER = 'Copper',
  FIREBLOCKS = "Fireblocks",
  COINCOVER = "Coincover"
}