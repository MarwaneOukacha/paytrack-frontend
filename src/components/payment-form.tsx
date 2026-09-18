"use client";

import { useEffect, useState } from "react";
import { Send, Zap } from "lucide-react";
import { usePayments } from "./payments-provider";
import { Panel } from "./panel";

export function PaymentForm() {
  const { accounts, sendPayment, burstFraud } = usePayments();
  const [acc, setAcc] = useState("");
  const [to, setTo] = useState("");
  const [amt, setAmt] = useState("500.00");
  const [desc, setDesc] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (accounts.length === 0) return;
    if (!accounts.some((a) => a.id === acc)) setAcc(accounts[0].id);
    const others = accounts.filter((a) => a.id !== acc);
    if (!others.some((a) => a.id === to)) setTo(others[0]?.id ?? accounts[0].id);
  }, [accounts, acc, to]);

  const submit = () => {
    const value = parseFloat(amt);
    const from = acc.trim();
    const dest = to.trim();
    if (!from || !dest || !(value > 0)) return;
    setSending(true);
    void sendPayment(from, dest, value, desc.trim());
    setDesc("");
    window.setTimeout(() => setSending(false), 950);
  };

  return (
    <Panel title={<span className="text-[15px] font-bold tracking-tight">Envoyer un paiement</span>}>
      <div className="flex flex-col gap-3.5 p-5">
        <label className="grid">
          <span className="lbl">Compte source</span>
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
          <span className="lbl">Compte destinataire</span>
          <input className="field" value={to} onChange={(e) => setTo(e.target.value)} list="dests" />
          <datalist id="dests">
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
          onClick={() => void burstFraud()}
          className="btn-quiet flex w-full items-center justify-center gap-1.5"
        >
          <Zap size={13} />
          Simuler 4 paiements en rafale → fraude
        </button>

        <p className="hint">
          Quatre paiements rapprochés d&apos;un même compte déclenchent la règle de vélocité : le
          compte passe en bloqué et les paiements sont rejetés.
        </p>
      </div>
    </Panel>
  );
}