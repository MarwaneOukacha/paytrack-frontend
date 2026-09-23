import type { AccountStatus, PaymentStatus } from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8085";

export const PAYMENTS_STREAM_URL = `${API_BASE_URL}/api/payments/stream`;

// ---------------------------------------------------------------------------
// DTOs renvoyés par la passerelle
// ---------------------------------------------------------------------------

export interface AccountDto {
  id: string;
  accountNumber: string;
  ownerName: string;
  ownerEmail: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentDto {
  id: string;
  accountId: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
  status: PaymentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentStatsDto {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  successfulAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  failedPayments: number;
  failedAmount: number;
  averageAmount: number;
  paymentsByStatus?: Record<string, number>;
}

export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateAccountDto {
  ownerName: string;
  ownerEmail: string;
  currency: string;
}

export interface TransferRequestDto {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}

export interface TransferResponseDto {
  transferId: string;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  currency?: string;
  status: PaymentStatus;
  message?: string;
  createdAt?: string;
}

export interface FraudEvaluationDto {
  id: string;
  paymentId: string;
  accountId: string;
  amount: number;
  currency?: string;
  decision: "APPROVED" | "REJECTED";
  reason?: string;
  evaluatedAt: string;
}

export interface FraudStatsDto {
  totalEvaluations: number;
  approvedCount: number;
  rejectedCount: number;
}

export type FraudRuleType = "HIGH_AMOUNT" | "REJECTION_RATE" | "VELOCITY";

export interface FraudConfigDto {
  id: string;
  ruleType: FraudRuleType;
  enabled: boolean;
  threshold: number;
  windowMinutes?: number;
  description?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFraudConfigDto {
  ruleType: FraudRuleType;
  enabled?: boolean;
  threshold: number;
  windowMinutes?: number;
  description?: string;
  updatedBy?: string;
}

export type UpdateFraudConfigDto = Partial<CreateFraudConfigDto>;

// ---------------------------------------------------------------------------
// Client HTTP vers la passerelle
// ---------------------------------------------------------------------------

interface ErrorBody {
  message?: string;
  error?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      ...init,
    });
  } catch {
    throw new Error(
      "Impossible de joindre la passerelle PayTrack, vérifiez qu'elle tourne sur le port 8085."
    );
  }

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = (await res.json()) as ErrorBody;
      if (body?.message) message = body.message;
    } catch {
      // corps non-JSON : on garde le message par défaut
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  accounts: () => request<PageDto<AccountDto>>("/api/accounts?size=100"),
  payments: () => request<PageDto<PaymentDto>>("/api/payments?size=100"),
  paymentStats: () => request<PaymentStatsDto>("/api/payments/stats"),
  createAccount: (body: CreateAccountDto) =>
    request<AccountDto>("/api/accounts", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  setAccountStatus: (id: string, action: "block" | "unblock") =>
    request<AccountDto>(`/api/accounts/${id}/${action}`, { method: "POST" }),
  transfer: (body: TransferRequestDto) =>
    request<TransferResponseDto>("/api/payments/transfer", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  fraudEvaluations: (rejectedOnly = true, limit = 50) =>
    request<FraudEvaluationDto[]>(
      `/api/fraud/evaluations?rejectedOnly=${rejectedOnly}&limit=${limit}`
    ),
  fraudStats: () => request<FraudStatsDto>("/api/fraud/stats"),
  fraudConfigs: () => request<FraudConfigDto[]>("/api/fraud/configs"),
  createFraudConfig: (body: CreateFraudConfigDto) =>
    request<FraudConfigDto>("/api/fraud/configs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateFraudConfig: (id: string, body: UpdateFraudConfigDto) =>
    request<FraudConfigDto>(`/api/fraud/configs/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteFraudConfig: (id: string) =>
    request<void>(`/api/fraud/configs/${id}`, { method: "DELETE" }),
  toggleFraudConfig: (id: string) =>
    request<FraudConfigDto>(`/api/fraud/configs/${id}/toggle`, {
      method: "POST",
    }),
  resetFraudConfigs: () =>
    request<FraudConfigDto[]>("/api/fraud/configs/defaults", {
      method: "POST",
    }),
};