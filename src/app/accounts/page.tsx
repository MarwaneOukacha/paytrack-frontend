"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
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
              <span className="lbl">Numéro (vide = généré)</span>
              <input
                className="field"
                placeholder="ACC-321"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
              />
            </label>
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
              <span className="lbl">Solde d&apos;ouverture en MAD</span>
              <input
                type="number"
                className="field"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </label>
            <button type="button" onClick={submit} className="btn">
              Ouvrir le compte
            </button>
            {manualId.trim().toUpperCase() && (
              <p className="hint">
                id annoncé :{" "}
                <span className="font-semibold text-ink">{manualId.trim().toUpperCase()}</span>
              </p>
            )}
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
                return (
                  <tr key={a.id}>
                    <td className="mono">{a.id}</td>
                    <td>{a.holder}</td>
                    <td className="right mono">{fmtMAD(a.balance)} MAD</td>
                    <td>
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          blocked ? "text-red" : "text-green"
                        )}
                      >
                        <span
                          className={clsx("size-1.5 rounded-full", blocked ? "bg-red" : "bg-green")}
                        />
                        {blocked ? "Bloqué" : "Actif"}
                      </span>
                    </td>
                    <td className="right">
                      <button
                        type="button"
                        onClick={() => toggleAccount(a.id)}
                        className="btn-quiet flex items-center gap-1.5"
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
    </div>
  );
}