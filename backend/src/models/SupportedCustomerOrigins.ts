export const SupportedCustomerOrigins = [ 'Altcoinomy', 'Fireblocks', 'CopperOTC', 'CelsiusImport', 'DCG' ] as const;
export type SupportedCustomerOrigin = typeof SupportedCustomerOrigins[number];