"use client";

import { RotateCcw, Save } from "lucide-react";
import { api, type SystemSettingDto } from "@/lib/api";
import { CONFIG_CATEGORY_LABELS } from "@/lib/types";
import type { ConfigCategory } from "@/lib/types";
import { useEffect, useState } from "react";

const CATEGORY_ORDER: ConfigCategory[] = ["SYSTEM", "INTEGRATION", "LOGGING"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettingDto[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = () =>
    api
      .systemSettings()
      .then((list) => {
        setSettings(list);
        setValues(Object.fromEntries(list.map((s) => [s.key, s.value])));
      })
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    void load();
  }, []);

  const save = async (s: SystemSettingDto) => {
    setBusyKey(s.key);
    setError("");
    setOk("");
    try {
      const updated = await api.updateSystemSetting(s.key, {
        value: values[s.key] ?? "",
      });
      setSettings((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setValues((prev) => ({ ...prev, [s.key]: updated.value }));
      setOk(`Configuration « ${s.key} » enregistrée.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setBusyKey(null);
    }
  };

  const reset = async () => {
    if (!window.confirm("Restaurer toutes les configurations système par défaut ?")) return;
    setError("");
    setOk("");
    try {
      const defaults = await api.resetSystemConfigs();
      setSettings(defaults);
      setValues(Object.fromEntries(defaults.map((s) => [s.key, s.value])));
      setOk("Configurations système restaurées aux valeurs par défaut.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: settings.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Configs système</h1>
          <p>Paramètres généraux, intégrations externes et journalisation des API</p>
        </div>
        <button type="button" onClick={() => void reset()} className="btn-quiet flex items-center gap-1.5">
          <RotateCcw size={13} />
          Valeurs par défaut
        </button>
      </div>

      {(error || ok) && (
        <p className={`mb-4 text-[13px] ${error ? "text-red" : "text-green"}`}>{error || ok}</p>
      )}

      {groups.length === 0 ? (
        <div className="panel empty">Aucune configuration disponible.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(({ cat, items }) => (
            <div className="panel" key={cat}>
              <div className="panel-head">
                <span className="text-[15px] font-bold tracking-tight">
                  {CONFIG_CATEGORY_LABELS[cat]}
                </span>
                <span className="badge badge-DLT">{items.length}</span>
              </div>
              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Clé</th>
                      <th>Description</th>
                      <th className="right">Valeur</th>
                      <th className="right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s) => (
                      <tr key={s.id}>
                        <td className="mono text-[12.5px] text-muted">{s.key}</td>
                        <td className="desc">{s.description || "—"}</td>
                        <td className="right">
                          <input
                            className="field !mt-0 !w-56"
                            value={values[s.key] ?? ""}
                            onChange={(e) =>
                              setValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                            }
                          />
                        </td>
                        <td className="right">
                          <button
                            type="button"
                            onClick={() => void save(s)}
                            disabled={busyKey === s.key}
                            className="btn-quiet flex items-center gap-1.5"
                            title="Enregistrer"
                          >
                            <Save size={12} />
                            {busyKey === s.key ? "…" : "Enregistrer"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}