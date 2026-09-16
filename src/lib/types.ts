export type PaymentStatus = "PENDING" | "PROCESSED" | "FAILED" | "FRAUD" | "DLT";

export type AccountStatus = "ACTIVE" | "BLOCKED";

export interface Account {
  id: string;
  holder: string;
  balance: number;
  status: AccountStatus;
}

export interface Payment {
  ref: string;
  acc: string;
  amt: number;
  status: PaymentStatus;
  desc?: string;
  time: string;
  ts: number;
}

export interface FraudAlert {
  acc: string;
  tx: number;
  ref: string;
  time: string;
}

export interface Figures {
  count: number;
  amount: number;
  fraud: number;
  dlt: number;
}

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  PROCESSED: "Réglé",
  FAILED: "Rejeté",
  FRAUD: "Fraude",
  DLT: "Dead letter",
};