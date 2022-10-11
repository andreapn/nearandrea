import type { AccountView } from "near-api-js/lib/providers/provider";

export interface Message {
  premium: boolean;
  sender: string;
  text: string;
}

export interface Address {
  a: string;
  b: number;
}

export type Account = AccountView & {
  account_id: string;
};

export interface Donate {
  account_id: string;
  total_amount: string;
}

export interface Msg {
  a: string;
  b: Array<Address>;
}
