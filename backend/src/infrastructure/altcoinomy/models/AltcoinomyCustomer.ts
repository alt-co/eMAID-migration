import { Customer } from "models/Customer";

const COLUMN_SUBSCRIPTION_ID = 'Subscription ID';
const COLUMN_USERNAME = 'Username';
const COLUMN_EMAIL = 'Customer - Email';
const COLUMN_TOKEN_DELIVERY_ADDRESS = 'Token delivery address';
const COLUMN_KYC_STATUS = 'KYC status';
const COLUMN_PAYMENT_STATUS = 'Global payment status';
const COLUMN_REFERRAL = 'Referal';

export const AltcoinomyCustomerData = [
  COLUMN_SUBSCRIPTION_ID,
  COLUMN_USERNAME,
  COLUMN_EMAIL,
  COLUMN_TOKEN_DELIVERY_ADDRESS,
  COLUMN_KYC_STATUS,
  COLUMN_PAYMENT_STATUS,
  COLUMN_REFERRAL,
] as const;

export interface AltcoinomyCustomer extends Customer<'Altcoinomy'> {
  origin: 'Altcoinomy';
  payload: {
    subscriptionId: string;
    email: string;
    username: string;
    referral?: string;
    senderAddress?: string;
  }
}