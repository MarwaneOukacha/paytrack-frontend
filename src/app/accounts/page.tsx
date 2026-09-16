"use client";

import { useState } from "react";
import { CirclePlus, Lock, Unlock, UserRound } from "lucide-react";
import { usePayments } from "@/components/payments-provider";
import { fmtMAD } from "@/lib/format";
import clsx from "clsx";

export default function AccountsPage() {
  const { accounts, openAccount, toggleAccount } = usePayments();
  const [holder, setHolder] = useState("");
  const [balance, setBalance] = useState("1000");
  const [manualId, setManualId] = useState("");

  const submit = () => {
    if (!holder.trim()) return;
    openAccount(holder.trim(), parseFloat(balance) || 0, manualId);
    setHolder("");
    setManualId("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="h-fit border border-rule bg-surface">
        <div className="border-b border-rule px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <CirclePlus size={15} />
            Ouvrir un compte
          </h2>
        </div>
        <div className="flex flex-col gap-3.5 p-4">
          <label className="grid gap-1.5">
            <span className="text-xs text-muted">Numéro (vide = généré)</span>
            <input
              className="w-full border border-rule bg-surface px-3 py-2 font-mono text-[13px] focus:border-ink focus:outline-none"
              placeholder="ACC-321"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs text-muted">Titulaire</span>
            <input
              className="w-full border border-rule bg-surface px-3 py-2 font-mono text-[13px] focus:border-ink focus:outline-none"
              placeholder="Nadia Chraibi"
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs text-muted">Solde d&apos;ouverture en MAD</span>
            <input
              type="number"
              className="w-full border border-rule bg-surface px-3 py-2 font-mono text-[13px] focus:border-ink focus:outline-none"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center justify-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-ink/85 dark:bg-dark-ink dark:text-ink"
          >
            Ouvrir le compte
          </button>
          {manualId.trim().toUpperCase() && (
            <p className="border-t border-rule pt-3 font-mono text-[11px] text-muted">
              id annoncé : <span className="text-ink">{manualId.trim().toUpperCase()}</span>
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-rule bg-surface">
        <div className="flex items-center border-b border-rule px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <UserRound size={15} />
            Comptes
          </h2>
          <span className="ml-auto rounded-full border border-rule px-2 py-0.5 font-mono text-xs text-muted">
            {accounts.length}
          </span>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-rule">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted">Compte</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted">Titulaire</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted">Solde</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted">État</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => {
              const blocked = a.status === "BLOCKED";
              return (
                <tr key={a.id} className="border-t border-rule first:border-t-0">
                  <td className="px-4 py-2.5 font-mono">{a.id}</td>
                  <td className="px-4 py-2.5">{a.holder}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {fmtMAD(a.balance)} MAD
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        blocked ? "text-alert" : "text-accent dark:text-dark-accent"
                      )}
                    >
                      <span
                        className={clsx(
                          "size-1.5 rounded-full",
                          blocked ? "bg-alert" : "bg-accent dark:bg-dark-accent"
                        )}
                      />
                      {blocked ? "Bloqué" : "Actif"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => toggleAccount(a.id)}
                      className="inline-flex items-center gap-1.5 border border-rule px-2 py-1 text-xs transition-colors hover:border-ink hover:text-ink"
                    >
                      {blocked ? <Unlock size={12} /> : <Lock size={12} />}
                      {blocked ? "Débloquer" : "Bloquer"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}