"use client";

import { Unlock } from "lucide-react";
import { usePayments } from "@/components/payments-provider";
import { fmtMAD } from "@/lib/format";

export default function FraudPage() {
  const { alerts, accounts, unblockAll } = usePayments();

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Alertes de fraude</h1>
          <p>Comptes ayant déclenché la règle de détection</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card empty">Aucun compte n&apos;a déclenché la règle. Lancez la rafale depuis la console.</div>
      ) : (
        alerts.map((al) => {
          const account = accounts.find((a) => a.id === al.acc);
          const isBlocked = account?.status === "BLOCKED";
          return (
            <div key={al.acc} className="alert-card">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="mono text-[15px] font-semibold">{al.acc}</span>
                <span className="text-[13.5px] text-red">{al.tx} paiements en 60s</span>
                <span className="mono ml-auto text-xs text-muted">{al.time}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => unblockAll(al.acc)}
                  className="btn-quiet flex items-center gap-1.5"
                >
                  <Unlock size={13} />
                  Débloquer le compte
                </button>
                <span className="mono text-xs text-muted">
                  paiement {al.ref} · {isBlocked ? "bloqué" : "compte débloqué"}
                  {account ? ` · solde ${fmtMAD(account.balance)} MAD` : ""}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}