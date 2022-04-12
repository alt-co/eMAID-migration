import { ForkVersions } from "models/ForkVersions";

export interface DepositData {
  pubkey: string,
  withdrawal_credentials: string,
  // Deposit validation tools need to be an integer
  amount: number,
  signature: string
  deposit_message_root: string,
  deposit_data_root: string,
  fork_version: string,
  eth2_network_name: keyof typeof ForkVersions;
  deposit_cli_version: string;
}