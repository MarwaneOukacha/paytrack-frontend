export type PaymentStatus =
  | "PENDING"
  | "PROCESSED"
  | "FAILED"
  | "FRAUD"
  | "REJECTED"
  | "COMPLETED"
  | "DLT";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "CLOSED";

export type CardStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED"
  | "EXPIRED"
  | "LOST"
  | "STOLEN"
  | "CANCELLED";

export type CardType = "VIRTUAL" | "PHYSICAL";

export type CardNetwork = "VISA" | "MASTERCARD";

export type ConfigCategory = "ACCOUNT" | "SYSTEM" | "INTEGRATION" | "LOGGING";

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

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Bloquée",
  EXPIRED: "Expirée",
  LOST: "Perdue",
  STOLEN: "Volée",
  CANCELLED: "Annulée",
};

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  VIRTUAL: "Virtuelle",
  PHYSICAL: "Physique",
};

export const CARD_NETWORK_LABELS: Record<CardNetwork, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
};

export const CONFIG_CATEGORY_LABELS: Record<ConfigCategory, string> = {
  ACCOUNT: "Configs compte",
  SYSTEM: "Système",
  INTEGRATION: "Intégrations",
  LOGGING: "Journaux API",
};