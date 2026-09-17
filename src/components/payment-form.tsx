"use client";

import { useState } from "react";
import { Send, Zap } from "lucide-react";
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

  return (
    <Panel title={<span className="text-[15px] font-bold tracking-tight">Envoyer un paiement</span>}>
      <div className="flex flex-col gap-3.5 p-5">
        <label className="grid">
          <span className="lbl">Compte</span>
          <input className="field" value={acc} onChange={(e) => setAcc(e.target.value)} list="accs" />
          <datalist id="accs">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.holder}
              </option>
            ))}
          </datalist>
        </label>

        <label className="grid">
          <span className="lbl">Montant en MAD (max 10 000)</span>
          <input
            type="number"
            className="field"
            value={amt}
            min={0}
            step="0.01"
            onChange={(e) => setAmt(e.target.value)}
          />
        </label>

        <label className="grid">
          <span className="lbl">Description</span>
          <input
            className="field"
            placeholder="Loyer, facture, virement…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={sending}
          className="btn flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Send size={15} />
          {sending ? "Traitement…" : "Envoyer le paiement"}
        </button>

        <button
          type="button"
          onClick={() => burstFraud()}
          className="btn-quiet flex w-full items-center justify-center gap-1.5"
        >
          <Zap size={13} />
          Simuler 4 paiements en rafale → fraude
        </button>

        <p className="hint">
          Quatre paiements d&apos;un même compte en une minute déclenchent la règle : le dernier est
          annulé et le compte passe en bloqué.
        </p>
      </div>
    </Panel>
  );
}