export type PaymentStatus =
  | "PENDING"
  | "PROCESSED"
  | "FAILED"
  | "FRAUD"
  | "REJECTED"
  | "COMPLETED"
  | "DLT";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "CLOSED";

export interface Account {
  id: string; // numéro de compte (ACC-…)
  uuid: string; // identifiant backend
  holder: string;
  email: string;
  currency: string;
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
  ref: string;
  time: string;
  reason: string;
}

export interface Figures {
  count: number;
  amount: number;
  fraud: number;
  dlt: number;
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  BLOCKED: "Bloqué",
  CLOSED: "Fermé",
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  PROCESSED: "Réglé",
  FAILED: "Échec",
  FRAUD: "Fraude",
  REJECTED: "Rejeté",
  COMPLETED: "Terminé",
  DLT: "Dead letter",
};