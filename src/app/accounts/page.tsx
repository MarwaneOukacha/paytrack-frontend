"use client";

import { Lock, Unlock } from "lucide-react";
import { usePayments } from "@/components/payments-provider";
import { fmtMAD } from "@/lib/format";
import { ACCOUNT_STATUS_LABELS } from "@/lib/types";
import type { AccountStatus } from "@/lib/types";
import clsx from "clsx";
import { useState } from "react";

const STATUS_COLORS: Record<AccountStatus, string> = {
  ACTIVE: "text-green",
  INACTIVE: "text-amber",
  BLOCKED: "text-red",
  CLOSED: "text-red",
};

const STATUS_DOT: Record<AccountStatus, string> = {
  ACTIVE: "bg-green",
  INACTIVE: "bg-amber",
  BLOCKED: "bg-red",
  CLOSED: "bg-red",
};

export default function AccountsPage() {
  const { accounts, openAccount, toggleAccount } = usePayments();
  const [holder, setHolder] = useState("");
  const [email, setEmail] = useState("");

  const submit = () => {
    if (!holder.trim() || !email.trim()) return;
    openAccount(holder.trim(), email.trim());
    setHolder("");
    setEmail("");
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Comptes</h1>
          <p>Ouverture et suivi des comptes PayTrack</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="panel">
          <div className="panel-head">
            <span className="text-[15px] font-bold tracking-tight">Ouvrir un compte</span>
          </div>
          <div className="flex flex-col gap-3.5 p-5">
            <label className="grid">
              <span className="lbl">Titulaire</span>
              <input
                className="field"
                placeholder="Nadia Chraibi"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
              />
            </label>
            <label className="grid">
              <span className="lbl">Email</span>
              <input
                type="email"
                className="field"
                placeholder="nadia@paytrack.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button type="button" onClick={submit} className="btn">
              Ouvrir le compte
            </button>
            <p className="hint">
              La devise est automatiquement <span className="font-semibold text-ink">MAD</span> et le solde débute à
              zéro.
            </p>
          </div>
        </div>

        <div className="panel scroll">
          <div className="panel-head">
            <span className="text-[15px] font-bold tracking-tight">Comptes</span>
            <span className="badge badge-DLT">{accounts.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Compte</th>
                <th>Titulaire</th>
                <th className="right">Solde</th>
                <th>État</th>
                <th className="right"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const blocked = a.status === "BLOCKED";
                const canToggle = a.status === "ACTIVE" || a.status === "INACTIVE" || a.status === "BLOCKED";
                return (
                  <tr key={a.uuid}>
                    <td className="mono">{a.id}</td>
                    <td>{a.holder}</td>
                    <td className="right mono">{fmtMAD(a.balance)} MAD</td>
                    <td>
                      <span className={clsx("inline-flex items-center gap-1.5 text-xs font-medium", STATUS_COLORS[a.status])}>
                        <span className={clsx("size-1.5 rounded-full", STATUS_DOT[a.status])} />
                        {ACCOUNT_STATUS_LABELS[a.status]}
                      </span>
                    </td>
                    <td className="right">
                      {canToggle && (
                        <button
                          type="button"
                          onClick={() => void toggleAccount(a)}
                          className="btn-quiet flex items-center gap-1.5"
                        >
                          {blocked ? <Unlock size={12} /> : <Lock size={12} />}
                          {blocked ? "Débloquer" : "Bloquer"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}