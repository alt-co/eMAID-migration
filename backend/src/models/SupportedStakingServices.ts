export const SupportedStakingServices = [ 'Allnodes', 'Staked', 'Ultimatenodes', 'DiviStaking' ] as const;
export type SupportedStakingService = typeof SupportedStakingServices[number];