import type { AccountView } from "near-api-js/lib/providers/provider";

export interface Message {
  premium: boolean;
  sender: string;
  text: string;
}

export interface Address {
  nearAddress: string;
  nearAmount: number;
}

export type Account = AccountView & {
  account_id: string;
};

export interface Donate {
  account_id: string;
  total_amount: string;
}
