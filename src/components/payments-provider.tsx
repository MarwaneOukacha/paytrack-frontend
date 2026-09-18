"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  PAYMENTS_STREAM_URL,
  api,
  type AccountDto,
  type FraudEvaluationDto,
  type PaymentDto,
} from "@/lib/api";
import type { Account, Figures, FraudAlert, Payment, PaymentStatus } from "@/lib/types";

const EMPTY_FIGURES: Figures = { count: 0, amount: 0, fraud: 0, dlt: 0 };
const FEED_LIMIT = 14;
const HISTORY_LIMIT = 200;

const num = (v: number | string | null | undefined) => (v == null ? 0 : Number(v));

const fmtTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("fr-MA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

const toAccount = (a: AccountDto): Account => ({
  id: a.accountNumber,
  uuid: a.id,
  holder: a.ownerName,
  email: a.ownerEmail,
  currency: a.currency,
  balance: num(a.balance),
  status: a.status,
});

const toPayment = (p: PaymentDto): Payment => ({
  ref: p.id,
  acc: p.accountId,
  amt: num(p.amount),
  status: p.status,
  desc: p.description,
  time: fmtTime(p.createdAt),
  ts: p.createdAt ? new Date(p.createdAt).getTime() : Date.now(),
});

const toAlert = (e: FraudEvaluationDto): FraudAlert => ({
  acc: e.accountId,
  ref: e.paymentId,
  time: new Date(e.evaluatedAt).toLocaleString("fr-MA"),
  reason: e.reason ?? "Transaction rejetée par la règle de fraude",
});

interface PaymentStore {
  accounts: Account[];
  history: Payment[];
  feed: Payment[];
  alerts: FraudAlert[];
  figures: Figures;
  banner: string | null;
  ready: boolean;
  clearBanner: () => void;
  sendPayment: (from: string, to: string, amt: number, desc: string) => Promise<void>;
  burstFraud: () => Promise<void>;
  openAccount: (holder: string, email: string, currency?: string) => Promise<void>;
  toggleAccount: (a: Account) => Promise<void>;
  unblockAll: (acc: string) => Promise<void>;
}

const Ctx = createContext<PaymentStore | null>(null);

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [feed, setFeed] = useState<Payment[]>([]);
  const [history, setHistory] = useState<Payment[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [figures, setFigures] = useState<Figures>(EMPTY_FIGURES);
  const [banner, setBanner] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const loadAccounts = useCallback(async () => {
    const page = await api.accounts();
    setAccounts(page.content.map(toAccount));
  }, []);

  const loadPayments = useCallback(async () => {
    const page = await api.payments();
    const items = page.content.map(toPayment);
    setHistory((prev) => {
      const merged = [...items, ...prev];
      const seen = new Set<string>();
      return merged
        .filter((p) => (seen.has(p.ref) ? false : (seen.add(p.ref), true)))
        .slice(0, HISTORY_LIMIT);
    });
    setFeed((prev) => {
      const merged = [...items, ...prev];
      const seen = new Set<string>();
      return merged
        .filter((p) => (seen.has(p.ref) ? false : (seen.add(p.ref), true)))
        .slice(0, FEED_LIMIT);
    });
  }, []);

  const loadFigures = useCallback(async () => {
    const [s, f] = await Promise.all([api.paymentStats(), api.fraudStats()]);
    setFigures({
      count: s && typeof s.totalPayments === "number" ? s.totalPayments : 0,
      amount: num(s?.totalAmount),
      fraud: f?.rejectedCount ?? 0,
      dlt: num(s?.paymentsByStatus?.DLT ?? 0),
    });
  }, []);

  const loadFraud = useCallback(async () => {
    const evaluations = await api.fraudEvaluations(true);
    setAlerts(evaluations.map(toAlert));
  }, []);

  const refresh = useCallback(async () => {
    const results = await Promise.allSettled([loadAccounts(), loadPayments(), loadFigures(), loadFraud()]);
    const failed = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
    if (failed) throw failed.reason;
  }, [loadAccounts, loadPayments, loadFigures, loadFraud]);

  useEffect(() => {
    let cancelled = false;
    if (ready) return;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        if (!cancelled) setBanner(e instanceof Error ? e.message : "Connexion à la passerelle impossible.");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, ready]);

  // Récupération continue des données (comptes, paiements, stats, fraude)
  useEffect(() => {
    const id = window.setInterval(() => {
      refresh().catch(() => {});
    }, 6000);
    return () => window.clearInterval(id);
  }, [refresh]);

  // Flux temps réel via SSE (passerelle → payment-service)
  useEffect(() => {
    let es = esRef.current;
    if (!es) {
      es = new EventSource(PAYMENTS_STREAM_URL);
      esRef.current = es;
    }
    const onPayment = (ev: MessageEvent) => {
      try {
        const payload = JSON.parse(ev.data as string) as PaymentDto;
        const item = toPayment(payload);
        setFeed((f) => [item, ...f.filter((p) => p.ref !== item.ref)].slice(0, FEED_LIMIT));
        setHistory((h) => [item, ...h.filter((p) => p.ref !== item.ref)].slice(0, HISTORY_LIMIT));
        setFigures((fg) => ({ ...fg, count: fg.count + 1 }));
      } catch {
        // événement mal formé : ignoré
      }
    };
    es.addEventListener("payment", onPayment);
    return () => {
      es.removeEventListener("payment", onPayment);
      es.close();
      esRef.current = null;
    };
  }, []);

  const sendPayment = useCallback(async (from: string, to: string, amt: number, desc: string) => {
    try {
      const res = await api.transfer({
        fromAccountNumber: from,
        toAccountNumber: to,
        amount: amt,
        description: desc,
      });
      const item: Payment = {
        ref: res.transferId,
        acc: from,
        amt: num(res.amount),
        status: res.status as PaymentStatus,
        desc: desc,
        time: fmtTime(res.createdAt),
        ts: res.createdAt ? new Date(res.createdAt).getTime() : Date.now(),
      };
      setFeed((f) => [item, ...f.filter((p) => p.ref !== item.ref)].slice(0, FEED_LIMIT));
      setHistory((h) => [item, ...h.filter((p) => p.ref !== item.ref)].slice(0, HISTORY_LIMIT));
      setFigures((fg) => ({ ...fg, count: fg.count + 1 }));
    } catch (e) {
      setBanner(e instanceof Error ? e.message : "Paiement refusé.");
    }
  }, []);

  const burstFraud = useCallback(async () => {
    const active = accounts.filter((a) => a.status === "ACTIVE");
    const from = active[0];
    const to = active.find((a) => a.id !== from?.id);
    if (!from || !to) {
      setBanner("Créez au moins deux comptes actifs pour lancer la simulation de rafale.");
      return;
    }
    for (let i = 0; i < 4; i++) {
      await sendPayment(from.id, to.id, 10, i === 3 ? "rafale" : "paiement en rafale");
      await new Promise((r) => setTimeout(r, 700));
    }
  }, [accounts, sendPayment]);

  const openAccount = useCallback(async (holder: string, email: string, currency = "MAD") => {
    if (!holder.trim() || !email.trim()) {
      setBanner("Titulaire et email sont requis pour ouvrir un compte.");
      return;
    }
    try {
      const created = await api.createAccount({
        ownerName: holder.trim(),
        ownerEmail: email.trim(),
        currency: currency.trim().toUpperCase(),
      });
      setAccounts((prev) => [toAccount(created), ...prev]);
    } catch (e) {
      setBanner(e instanceof Error ? e.message : "Création de compte impossible.");
    }
  }, []);

  const toggleAccount = useCallback(async (a: Account) => {
    try {
      const action = a.status === "BLOCKED" ? "unblock" : "block";
      const updated = await api.setAccountStatus(a.uuid, action);
      setAccounts((prev) => prev.map((x) => (x.uuid === updated.id ? toAccount(updated) : x)));
    } catch (e) {
      setBanner(e instanceof Error ? e.message : "Changement de statut impossible.");
    }
  }, []);

  const unblockAll = useCallback(
    async (acc: string) => {
      const account = accounts.find((a) => a.id === acc);
      if (account && account.status === "BLOCKED") {
        try {
          const updated = await api.setAccountStatus(account.uuid, "unblock");
          setAccounts((prev) => prev.map((x) => (x.uuid === updated.id ? toAccount(updated) : x)));
        } catch {
          // l'actualisation périodique resynchronisera l'état réel
        }
      }
      setAlerts((prev) => prev.filter((al) => al.acc !== acc));
      setBanner(null);
    },
    [accounts]
  );

  return (
    <Ctx.Provider
      value={{
        accounts,
        history,
        feed,
        alerts,
        figures,
        banner,
        ready,
        clearBanner: () => setBanner(null),
        sendPayment,
        burstFraud,
        openAccount,
        toggleAccount,
        unblockAll,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePayments() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePayments must be used within <PaymentsProvider>");
  return ctx;
}