import type { AccountStatus, CardNetwork, CardStatus, CardType, ConfigCategory, PaymentStatus } from "@/lib/types";
import { getAccessToken, notifyUnauthorized } from "@/lib/oidc";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8085";

export const PAYMENTS_STREAM_URL = `${API_BASE_URL}/api/payments/stream`;

function authHeaders(extra?: HeadersInit) {
  const headers = new Headers(extra);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

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

export interface LimitConfigDto {
  defaultCurrency: string;
  defaultSingleTransactionLimit: number;
  defaultDailyLimit: number;
  defaultMonthlyLimit: number;
  maxSingleTransactionLimit: number;
  maxDailyLimit: number;
  maxMonthlyLimit: number;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateLimitConfigDto = Partial<LimitConfigDto>;

export interface SystemSettingDto {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: ConfigCategory;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSystemSettingDto {
  value: string;
  description?: string;
  updatedBy?: string;
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

export interface CardDto {
  id: string;
  cardNumber: string;
  lastFourDigits: string;
  cardholderName: string;
  accountId: string;
  accountNumber: string;
  network: CardNetwork;
  type: CardType;
  expiryMonth: string;
  expiryYear: string;
  status: CardStatus;
  singleTransactionLimit?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  currency?: string;
  issuedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCardDto {
  accountId: string;
  type: CardType;
  network: CardNetwork;
  singleTransactionLimit?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  currency?: string;
}

export type UpdateCardDto = Partial<CreateCardDto>;

export type CardStatusAction =
  | "activate"
  | "deactivate"
  | "block"
  | "unblock"
  | "expire"
  | "lost"
  | "stolen";

export interface CardNumberDto {
  cardId: string;
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  network: CardNetwork;
  type: CardType;
}

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
      ...init,
      headers: authHeaders({ "Content-Type": "application/json", ...init?.headers }),
    });
  } catch {
    throw new Error(
      "Impossible de joindre la passerelle PayTrack, vérifiez qu'elle tourne sur le port 8085."
    );
  }

  if (res.status === 401) {
    notifyUnauthorized();
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
  cards: () => request<PageDto<CardDto>>("/api/cards?size=100"),
  createCard: (body: CreateCardDto) =>
    request<CardDto>("/api/cards", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  setCardStatus: (id: string, action: CardStatusAction) =>
    request<CardDto>(`/api/cards/${id}/${action}`, { method: "POST" }),
  updateCard: (id: string, body: UpdateCardDto) =>
    request<CardDto>(`/api/cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  revealCardNumber: (id: string) =>
    request<CardNumberDto>(`/api/cards/${id}/number`),
  deleteCard: (id: string) =>
    request<void>(`/api/cards/${id}`, { method: "DELETE" }),
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
  limitConfig: () => request<LimitConfigDto>("/api/configs/limits"),
  updateLimitConfig: (body: UpdateLimitConfigDto) =>
    request<LimitConfigDto>("/api/configs/limits", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  systemSettings: (category?: ConfigCategory) =>
    request<SystemSettingDto[]>(
      `/api/configs/system${category ? `?category=${category}` : ""}`
    ),
  updateSystemSetting: (key: string, body: UpdateSystemSettingDto) =>
    request<SystemSettingDto>(`/api/configs/system/${key}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  resetSystemConfigs: () =>
    request<SystemSettingDto[]>("/api/configs/system/defaults", {
      method: "POST",
    }),
};

const STREAM_RETRY_MS = 3000;

function parseSseChunk(chunk: string) {
  const data = chunk
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n");

  if (!data) return null;

  try {
    return JSON.parse(data) as PaymentDto;
  } catch {
    return null;
  }
}

export function subscribeToPayments(onPayment: (payment: PaymentDto) => void) {
  let closed = false;
  let unauthorized = false;
  let controller: AbortController | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const connect = async () => {
    if (closed) return;
    controller = new AbortController();

    try {
      const res = await fetch(PAYMENTS_STREAM_URL, {
        headers: authHeaders({ Accept: "text/event-stream" }),
        cache: "no-store",
        signal: controller.signal,
      });

      if (res.status === 401) {
        unauthorized = true;
        notifyUnauthorized();
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error(`Flux indisponible (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!closed) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";

        for (const event of events) {
          const payment = parseSseChunk(event);
          if (payment) onPayment(payment);
        }
      }
    } catch (error) {
      if (closed || (error as Error).name === "AbortError") return;
    } finally {
      if (!closed && !unauthorized) {
        retryTimer = setTimeout(() => void connect(), STREAM_RETRY_MS);
      }
    }
  };

  void connect();

  return () => {
    closed = true;
    controller?.abort();
    if (retryTimer) clearTimeout(retryTimer);
  };
}