"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { usePayments } from "@/components/payments-provider";
import { StatusBadge } from "@/components/status-badge";
import { fmtMAD } from "@/lib/format";
import type { PaymentStatus } from "@/lib/types";

const STATUS_OPTIONS: Array<PaymentStatus | ""> = ["", "PENDING", "PROCESSED", "FAILED", "FRAUD", "DLT"];
const PAGE_SIZE = 12;

export default function HistoryPage() {
  const { history } = usePayments();
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [acc, setAcc] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      history.filter(
        (p) =>
          (!status || p.status === status) &&
          (!acc || p.acc.toUpperCase().includes(acc.toUpperCase()))
      ),
    [history, status, acc]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <h1 className="mr-auto text-lg font-bold tracking-tight">Historique</h1>
        <label className="grid gap-1 text-xs text-muted">
          Statut
          <span className="relative">
            <SlidersHorizontal size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as PaymentStatus | "");
                setPage(0);
              }}
              className="w-36 appearance-none border border-rule bg-surface py-2 pl-8 pr-3 font-mono text-[13px] focus:border-ink focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s || "all"} value={s}>
                  {s || "Tous"}
                </option>
              ))}
            </select>
          </span>
        </label>
        <label className="grid gap-1 text-xs text-muted">
          Compte
          <span className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={acc}
              onChange={(e) => {
                setAcc(e.target.value);
                setPage(0);
              }}
              placeholder="ACC-123"
              className="w-36 border border-rule bg-surface py-2 pl-8 pr-3 font-mono text-[13px] focus:border-ink focus:outline-none"
            />
          </span>
        </label>
      </div>

      <div className="overflow-x-auto border border-rule bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-rule">
              <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-muted">Heure</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-muted">Référence</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-muted">Compte</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-muted">Description</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-medium text-muted">Montant</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-muted">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.ref} className="border-t border-rule first:border-t-0">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">{p.time}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs">{p.ref}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono">{p.acc}</td>
                <td className="max-w-60 px-4 py-2.5 text-muted">{p.desc || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                  {fmtMAD(p.amt)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted">
            Aucun paiement ne correspond à ces filtres.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 font-mono text-xs text-muted">
        <button
          type="button"
          disabled={safePage === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="inline-flex items-center gap-1 border border-rule px-2.5 py-1.5 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={13} />
          Précédent
        </button>
        <span className="tabular-nums">
          page {safePage + 1} / {totalPages} — {filtered.length} paiements
        </span>
        <button
          type="button"
          disabled={safePage >= totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          className="inline-flex items-center gap-1 border border-rule px-2.5 py-1.5 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}