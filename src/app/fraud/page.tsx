"use client";

import { ShieldAlert, Unlock, Clock } from "lucide-react";
import { usePayments } from "@/components/payments-provider";
import { fmtMAD } from "@/lib/format";

export default function FraudPage() {
  const { alerts, accounts, unblockAll } = usePayments();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold tracking-tight">Alertes de fraude</h1>

      {alerts.length === 0 ? (
        <div className="border border-rule bg-surface px-4 py-16 text-center">
          <ShieldAlert size={28} className="mx-auto mb-3 text-muted/50" />
          <p className="text-sm text-muted">
            Aucun compte n&apos;a déclenché la règle. Lancez la rafale depuis la console.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((al) => {
            const account = accounts.find((a) => a.id === al.acc);
            const isBlocked = account?.status === "BLOCKED";
            return (
              <div
                key={al.acc}
                className="border border-rule border-l-2 border-l-alert bg-surface p-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-base">{al.acc}</span>
                  <span className="text-sm text-alert">
                    {al.tx} paiements en 60s
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-mono text-xs text-muted">
                    <Clock size={12} />
                    {al.time}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => unblockAll(al.acc)}
                    className="inline-flex items-center gap-1.5 border border-rule px-2.5 py-1.5 text-xs transition-colors hover:border-ink hover:text-ink"
                  >
                    <Unlock size={13} />
                    Débloquer le compte
                  </button>
                  <span className="font-mono text-xs text-muted">
                    paiement {al.ref} · {isBlocked ? "bloqué" : "compte débloqué"}
                    {account ? ` · solde ${fmtMAD(account.balance)} MAD` : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}