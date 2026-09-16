"use client";

import { useState } from "react";
import { Send, Zap, Info } from "lucide-react";
import { usePayments } from "./payments-provider";
import { Panel } from "./panel";

export function PaymentForm() {
  const { accounts, sendPayment, burstFraud } = usePayments();
  const [acc, setAcc] = useState("ACC-123");
  const [amt, setAmt] = useState("500.00");
  const [desc, setDesc] = useState("");
  const [sending, setSending] = useState(false);

  const submit = () => {
    const value = parseFloat(amt);
    const id = acc.trim().toUpperCase();
    if (!id || !(value > 0)) return;
    setSending(true);
    sendPayment(id, value, desc.trim());
    setDesc("");
    window.setTimeout(() => setSending(false), 950);
  };

  const burst = () => {
    burstFraud();
  };

  return (
    <Panel title={<h2 className="text-sm font-medium">Envoyer un paiement</h2>}>
      <div className="flex flex-col gap-3.5 p-4">
        <label className="grid gap-1.5">
          <span className="text-xs text-muted">Compte</span>
          <input
            className="w-full border border-rule bg-surface px-3 py-2 font-mono text-[13px] text-ink transition-colors focus:border-ink focus:outline-none"
            value={acc}
            onChange={(e) => setAcc(e.target.value)}
            list="accs"
          />
          <datalist id="accs">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.holder}
              </option>
            ))}
          </datalist>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs text-muted">Montant en MAD (max 10 000)</span>
          <input
            type="number"
            className="w-full border border-rule bg-surface px-3 py-2 font-mono text-[13px] text-ink transition-colors focus:border-ink focus:outline-none"
            value={amt}
            min={0}
            step="0.01"
            onChange={(e) => setAmt(e.target.value)}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs text-muted">Description</span>
          <input
            className="w-full border border-rule bg-surface px-3 py-2 font-mono text-[13px] text-ink transition-colors focus:border-ink focus:outline-none"
            placeholder="Loyer, facture, virement…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 bg-ink px-4 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-ink/85 disabled:opacity-60 dark:bg-dark-ink dark:text-ink"
        >
          <Send size={15} />
          {sending ? "Traitement…" : "Envoyer le paiement"}
        </button>

        <button
          type="button"
          onClick={burst}
          className="inline-flex items-center justify-center gap-2 border border-rule px-3 py-2 text-xs text-muted transition-colors hover:border-ink hover:text-ink"
        >
          <Zap size={14} />
          Simuler 4 paiements en rafale → fraude
        </button>

        <p className="flex items-start gap-2 border-t border-rule pt-3 text-xs leading-relaxed text-muted">
          <Info size={13} className="mt-0.5 shrink-0" />
          Quatre paiements d&apos;un même compte en une minute déclenchent la règle : le
          dernier est annulé et le compte passe en bloqué.
        </p>
      </div>
    </Panel>
  );
}