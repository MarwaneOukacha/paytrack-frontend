"use client";

import { Info, Save } from "lucide-react";
import { api, type LimitConfigDto } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LimitsPage() {
  const [config, setConfig] = useState<LimitConfigDto | null>(null);

  const [defaultCurrency, setDefaultCurrency] = useState("MAD");
  const [defaultSingle, setDefaultSingle] = useState("");
  const [defaultDaily, setDefaultDaily] = useState("");
  const [defaultMonthly, setDefaultMonthly] = useState("");
  const [maxSingle, setMaxSingle] = useState("");
  const [maxDaily, setMaxDaily] = useState("");
  const [maxMonthly, setMaxMonthly] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .limitConfig()
      .then((cfg) => {
        setConfig(cfg);
        setDefaultCurrency(cfg.defaultCurrency);
        setDefaultSingle(String(cfg.defaultSingleTransactionLimit));
        setDefaultDaily(String(cfg.defaultDailyLimit));
        setDefaultMonthly(String(cfg.defaultMonthlyLimit));
        setMaxSingle(String(cfg.maxSingleTransactionLimit));
        setMaxDaily(String(cfg.maxDailyLimit));
        setMaxMonthly(String(cfg.maxMonthlyLimit));
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const num = (s: string) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : undefined;
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const updated = await api.updateLimitConfig({
        defaultCurrency: defaultCurrency.trim() || undefined,
        defaultSingleTransactionLimit: num(defaultSingle),
        defaultDailyLimit: num(defaultDaily),
        defaultMonthlyLimit: num(defaultMonthly),
        maxSingleTransactionLimit: num(maxSingle),
        maxDailyLimit: num(maxDaily),
        maxMonthlyLimit: num(maxMonthly),
      });
      setConfig(updated);
      setDefaultCurrency(updated.defaultCurrency);
      setOk("Configuration des plafonds enregistrée.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  };

  const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="panel">
      <div className="panel-head">
        <span className="text-[15px] font-bold tracking-tight">{title}</span>
      </div>
      <div className="flex flex-col gap-3.5 p-5">{children}</div>
    </div>
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Plafonds &amp; configs compte</h1>
          <p>Limites par défaut appliquées à l&apos;émission des cartes, et plafonds maximum autorisés</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Panel title="Plafonds par défaut (nouvelles cartes)">
            <div className="grid grid-cols-2 gap-3">
              <label className="grid">
                <span className="lbl">Devise par défaut</span>
                <input
                  className="field"
                  maxLength={3}
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
                />
              </label>
              <div />
              <label className="grid">
                <span className="lbl">Par opération (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={defaultSingle} onChange={(e) => setDefaultSingle(e.target.value)} />
              </label>
              <label className="grid">
                <span className="lbl">Par opération — max (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={maxSingle} onChange={(e) => setMaxSingle(e.target.value)} />
              </label>
              <label className="grid">
                <span className="lbl">Journalier (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={defaultDaily} onChange={(e) => setDefaultDaily(e.target.value)} />
              </label>
              <label className="grid">
                <span className="lbl">Journalier — max (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={maxDaily} onChange={(e) => setMaxDaily(e.target.value)} />
              </label>
              <label className="grid">
                <span className="lbl">Mensuel (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={defaultMonthly} onChange={(e) => setDefaultMonthly(e.target.value)} />
              </label>
              <label className="grid">
                <span className="lbl">Mensuel — max (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={maxMonthly} onChange={(e) => setMaxMonthly(e.target.value)} />
              </label>
            </div>

            {error && <p className="text-[12.5px] text-red">{error}</p>}
            {ok && <p className="text-[12.5px] text-green">{ok}</p>}

            <button type="button" onClick={save} disabled={busy} className="btn flex items-center justify-center gap-1.5">
              <Save size={14} />
              {busy ? "Enregistrement…" : "Enregistrer la configuration"}
            </button>

            <p className="hint">
              Un plafond « défaut » ne peut pas dépasser le plafond « max » correspondant. Les
              plafonds par défaut s&apos;appliquent aux cartes émises dont les champs ne sont pas
              renseignés.
            </p>
          </Panel>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
            <Info size={15} />
            Application
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Les plafonds par défaut sont utilisés lors de l&apos;émission d&apos;une carte via{" "}
            <Link href="/cards" className="font-semibold text-blue underline">
              Cartes bancaires
            </Link>
            . Les plafonds maximum bornent toute demande (émission ou modification) côté serveur.
          </p>
          {config && (
            <dl className="mt-4 flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Devise</dt>
                <dd className="font-semibold text-ink">{config.defaultCurrency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Par opération</dt>
                <dd className="mono font-semibold">{config.defaultSingleTransactionLimit} MAD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Journalier</dt>
                <dd className="mono font-semibold">{config.defaultDailyLimit} MAD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Mensuel</dt>
                <dd className="mono font-semibold">{config.defaultMonthlyLimit} MAD</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}