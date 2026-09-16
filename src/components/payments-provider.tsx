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
import type { Account, Figures, FraudAlert, Payment, PaymentStatus } from "@/lib/types";

const now = () =>
  new Date().toLocaleTimeString("fr-MA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const mkRef = () => Math.random().toString(16).slice(2, 10);

const BASE_FIGURES: Figures = { count: 128, amount: 54320, fraud: 2, dlt: 1 };

interface PaymentStore {
  accounts: Account[];
  history: Payment[];
  feed: Payment[];
  alerts: FraudAlert[];
  figures: Figures;
  banner: string | null;
  clearBanner: () => void;
  sendPayment: (acc: string, amt: number, desc: string) => void;
  burstFraud: () => void;
  openAccount: (holder: string, balance: number, id?: string) => void;
  toggleAccount: (id: string) => void;
  unblockAll: (acc: string) => void;
}

const Ctx = createContext<PaymentStore | null>(null);

const seedAccounts: Account[] = [
  { id: "ACC-123", holder: "Yassine Bennani", balance: 25000, status: "ACTIVE" },
  { id: "ACC-456", holder: "Salma El Idrissi", balance: 8000, status: "ACTIVE" },
  { id: "ACC-789", holder: "Omar Tazi", balance: 1500, status: "ACTIVE" },
];

const seedRows: Array<[string, number, PaymentStatus, string]> = [
  ["ACC-123", 450, "PROCESSED", "Facture 42"],
  ["ACC-456", 1200, "PROCESSED", "Loyer"],
  ["ACC-789", 2000, "FAILED", "Solde insuffisant"],
  ["ACC-123", 80, "PROCESSED", "Café"],
  ["ACC-456", 15, "DLT", "Erreur technique"],
  ["ACC-789", 320, "PROCESSED", "Courses"],
  ["ACC-123", 2100, "PROCESSED", "Virement Salaire"],
  ["ACC-456", 45, "PENDING", "Abonnement streaming"],
  ["ACC-123", 12.5, "PROCESSED", "Parking"],
  ["ACC-789", 999.99, "FRAUD", "Montant douteux"],
  ["ACC-456", 33, "DLT", "Format invalide"],
  ["ACC-123", 560, "PROCESSED", "Facture télécom"],
];

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts);
  const [feed, setFeed] = useState<Payment[]>([]);
  const [history, setHistory] = useState<Payment[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [figures, setFigures] = useState<Figures>(BASE_FIGURES);
  const [banner, setBanner] = useState<string | null>(null);
  const feedLock = useRef(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const items: Payment[] = seedRows.map((r, i) => ({
      ref: mkRef(),
      acc: r[0],
      amt: r[1],
      status: r[2],
      desc: r[3],
      time: now(),
      ts: Date.now() - (seedRows.length - i) * 15000,
    }));
    setFeed(items);
    setHistory(items);
  }, []);

  const push = useCallback(
    (acc: string, amt: number, status: PaymentStatus, desc: string, ts: number) => {
      const item: Payment = { ref: mkRef(), acc, amt, status, desc, time: now(), ts };
      setFeed((f) => [{ ...item, ts: Date.now() }, ...f].slice(0, 14));
      setHistory((h) => [item, ...h]);
      setFigures((fg) => ({
        count: fg.count + 1,
        amount: fg.amount + (status === "PROCESSED" ? amt : 0),
        fraud: fg.fraud + (status === "FRAUD" ? 1 : 0),
        dlt: fg.dlt + (status === "DLT" ? 1 : 0),
      }));
      return item;
    },
    []
  );

  const patchPayment = useCallback((ref: string, status: PaymentStatus, desc: string, amt: number) => {
    setFeed((f) => f.map((p) => (p.ref === ref ? { ...p, status, desc } : p)));
    setHistory((h) => h.map((p) => (p.ref === ref ? { ...p, status, desc } : p)));
    if (status === "PROCESSED") {
      setFigures((fg) => ({ ...fg, amount: fg.amount + amt }));
    }
  }, []);

  const sendPayment = useCallback(
    (acc: string, amt: number, desc: string) => {
      feedLock.current = true;
      const item = push(acc, amt, "PENDING", desc, Date.now());
      window.setTimeout(() => {
        const account = accounts.find((a) => a.id === acc);
        let status: PaymentStatus = "PROCESSED";
        let note = desc;
        if (!account) {
          status = "FAILED";
          note = "Compte inconnu";
        } else if (account.status === "BLOCKED") {
          status = "FAILED";
          note = "Compte bloqué";
        } else if (account.balance < amt) {
          status = "FAILED";
          note = "Solde insuffisant";
        } else {
          account.balance -= amt;
          status = "PROCESSED";
          note = desc;
          setAccounts((prev) => prev.map((a) => (a.id === acc ? { ...account } : a)));
        }
        patchPayment(item.ref, status, note, status === "PROCESSED" ? amt : 0);
        feedLock.current = false;
      }, 900);
    },
    [accounts, push, patchPayment]
  );

  const burstFraud = useCallback(() => {
    const acc = "ACC-789";
    const account = accounts.find((a) => a.id === acc);
    if (!account) return;
    if (account.status !== "ACTIVE") {
      setAccounts((prev) => prev.map((a) => (a.id === acc ? { ...a, status: "ACTIVE" as const } : a)));
    }
    [0, 350, 700, 1050].forEach((delay, i) => {
      window.setTimeout(() => {
        const item = push(
          acc,
          10,
          i === 3 ? "FRAUD" : "PROCESSED",
          i === 3 ? "4 paiements en 60s" : "rafale",
          Date.now()
        );
        if (i === 3) {
          setAccounts((prev) =>
            prev.map((a) => (a.id === acc ? { ...a, status: "BLOCKED" as const } : a))
          );
          setAlerts((prev) => [
            { acc, tx: 4, ref: item.ref, time: new Date().toLocaleString("fr-MA") },
            ...prev,
          ]);
          setBanner(`${acc} bloqué — 4 paiements en une minute`);
        }
      }, delay);
    });
  }, [accounts, push]);

  const openAccount = useCallback((holder: string, balance: number, id?: string) => {
    setAccounts((prev) => [
      {
        id: id?.trim().toUpperCase() || "ACC-" + Math.floor(100 + Math.random() * 900),
        holder,
        balance,
        status: "ACTIVE" as const,
      },
      ...prev,
    ]);
  }, []);

  const toggleAccount = useCallback((id: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "BLOCKED" ? "ACTIVE" : "BLOCKED" } : a
      )
    );
  }, []);

  const unblockAll = useCallback((acc: string) => {
    setAccounts((prev) => prev.map((a) => (a.id === acc ? { ...a, status: "ACTIVE" as const } : a)));
    setAlerts([]);
    setBanner(null);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (feedLock.current) return;
      const random = accounts[Math.floor(Math.random() * accounts.length)];
      if (!random || random.status === "BLOCKED") return;
      const amt = Math.round((20 + Math.random() * 900) * 100) / 100;
      const ok = random.balance >= amt;
      if (ok) {
        const updated = { ...random, balance: random.balance - amt };
        setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
      push(random.id, amt, ok ? "PROCESSED" : "FAILED", ok ? "virement" : "Solde insuffisant", Date.now());
    }, 6500);
    return () => window.clearInterval(id);
  }, [accounts, push]);

  return (
    <Ctx.Provider
      value={{
        accounts,
        history,
        feed,
        alerts,
        figures,
        banner,
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