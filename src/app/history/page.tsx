"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { usePayments } from "@/components/payments-provider";
import { StatusBadge } from "@/components/status-badge";
import { fmtMAD } from "@/lib/format";
import type { PaymentStatus } from "@/lib/types";

const STATUS_OPTIONS: Array<PaymentStatus | ""> = ["", "PENDING", "PROCESSED", "FAILED", "FRAUD", "DLT"];
const PAGE_SIZE = 10;

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
    <div>
      <div className="page-head">
        <div>
          <h1>Paiements</h1>
          <p>Historique complet, filtrable par statut et par compte</p>
        </div>
      </div>

      <div className="toolbar">
        <label className="pill">
          <SlidersHorizontal size={13} className="text-muted" />
          Statut
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as PaymentStatus | "");
              setPage(0);
            }}
            className="cursor-pointer border-0 bg-transparent text-[13.5px] font-medium text-ink focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "Tous"}
              </option>
            ))}
          </select>
        </label>
        <label className="pill">
          Compte
          <input
            value={acc}
            onChange={(e) => {
              setAcc(e.target.value);
              setPage(0);
            }}
            placeholder="ACC-123"
            className="w-[110px] border-0 bg-transparent text-[13.5px] font-medium text-ink focus:outline-none placeholder:text-faint"
          />
        </label>
      </div>

      <div className="panel scroll">
        <table>
          <thead>
            <tr>
              <th>Heure</th>
              <th>Référence</th>
              <th>Compte</th>
              <th>Description</th>
              <th className="right">Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.ref}>
                <td className="mono text-xs text-muted">{p.time}</td>
                <td className="mono text-xs">{p.ref}</td>
                <td className="mono">{p.acc}</td>
                <td className="desc">{p.desc || "—"}</td>
                <td className="right mono">{fmtMAD(p.amt)}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="empty">Aucun paiement ne correspond à ces filtres.</p>
        )}
        <div className="pager">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="btn-quiet flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40"
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
            className="btn-quiet flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}