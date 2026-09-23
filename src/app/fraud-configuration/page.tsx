"use client";

import {
  Pencil,
  Power,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import { api, type FraudConfigDto, type FraudRuleType } from "@/lib/api";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

const RULE_TYPES: FraudRuleType[] = ["HIGH_AMOUNT", "REJECTION_RATE", "VELOCITY"];

const RULE_TYPE_LABELS: Record<FraudRuleType, string> = {
  HIGH_AMOUNT: "Montant élevé",
  REJECTION_RATE: "Taux de rejet",
  VELOCITY: "Vélocité",
};

const RULE_TYPE_REQUIRES_WINDOW: Record<FraudRuleType, boolean> = {
  HIGH_AMOUNT: false,
  REJECTION_RATE: true,
  VELOCITY: true,
};

const formatThreshold = (c: FraudConfigDto) => {
  if (c.ruleType === "HIGH_AMOUNT") {
    return `${new Intl.NumberFormat("fr-MA").format(c.threshold)} MAD`;
  }
  return new Intl.NumberFormat("fr-MA").format(c.threshold);
};

export default function FraudConfigurationPage() {
  const [configs, setConfigs] = useState<FraudConfigDto[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [ruleType, setRuleType] = useState<FraudRuleType | "">("");
  const [threshold, setThreshold] = useState("");
  const [windowMinutes, setWindowMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);

  const usedTypes = useMemo(() => new Set(configs.map((c) => c.ruleType)), [configs]);
  const editableType = editingId
    ? configs.find((c) => c.id === editingId)?.ruleType
    : null;

  useEffect(() => {
    api.fraudConfigs().then(setConfigs).catch((e: Error) => setError(e.message));
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setRuleType("");
    setThreshold("");
    setWindowMinutes("");
    setDescription("");
    setEnabled(true);
  };

  const submit = async () => {
    const num = parseFloat(threshold);
    if (!Number.isFinite(num) || num <= 0) {
      setError("Le seuil doit être un nombre positif.");
      return;
    }

    const win = windowMinutes.trim() ? parseInt(windowMinutes, 10) : undefined;
    const type = (editingId ? editableType : ruleType) as FraudRuleType | null;
    if (!type) {
      setError("Choisissez une règle à configurer.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (editingId) {
        const updated = await api.updateFraudConfig(editingId, {
          threshold: num,
          windowMinutes: win,
          enabled,
          description: description.trim() || undefined,
        });
        setConfigs((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      } else {
        const created = await api.createFraudConfig({
          ruleType: type,
          threshold: num,
          enabled,
          windowMinutes: win,
          description: description.trim() || undefined,
        });
        setConfigs((prev) => [...prev, created]);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: FraudConfigDto) => {
    try {
      const updated = await api.toggleFraudConfig(c.id);
      setConfigs((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  const startEdit = (c: FraudConfigDto) => {
    setEditingId(c.id);
    setThreshold(String(c.threshold));
    setWindowMinutes(c.windowMinutes ? String(c.windowMinutes) : "");
    setDescription(c.description ?? "");
    setEnabled(c.enabled);
    setError("");
  };

  const remove = async (c: FraudConfigDto) => {
    if (!window.confirm(`Supprimer la règle « ${RULE_TYPE_LABELS[c.ruleType]} » ?`)) return;
    try {
      await api.deleteFraudConfig(c.id);
      setConfigs((prev) => prev.filter((x) => x.id !== c.id));
      if (editingId === c.id) resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  const resetDefaults = async () => {
    if (!window.confirm("Rétablir tous les seuils par défaut ?")) return;
    setBusy(true);
    setError("");
    try {
      const defaults = await api.resetFraudConfigs();
      setConfigs(defaults);
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  };

  const showWindow = !!(
    (editingId ? editableType : ruleType) &&
    RULE_TYPE_REQUIRES_WINDOW[(editingId ? editableType : ruleType) as FraudRuleType]
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Règles de fraude</h1>
          <p>Seuils et fenêtres utilisés par la détection automatique</p>
        </div>
        <div className="toolbar">
          <button type="button" onClick={resetDefaults} disabled={busy} className="btn-quiet flex items-center gap-1.5">
            <RotateCcw size={13} />
            Valeurs par défaut
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="panel">
          <div className="panel-head">
            <span className="text-[15px] font-bold tracking-tight">
              {editingId ? "Modifier la règle" : "Ajouter une règle"}
            </span>
          </div>
          <div className="flex flex-col gap-3.5 p-5">
            {editingId && editableType ? (
              <label className="grid">
                <span className="lbl">Règle</span>
                <span className="mt-1.5 text-sm font-semibold text-ink">
                  {RULE_TYPE_LABELS[editableType]}
                </span>
              </label>
            ) : (
              <label className="grid">
                <span className="lbl">Règle</span>
                <select
                  className="field"
                  value={ruleType}
                  onChange={(e) => {
                    setRuleType(e.target.value as FraudRuleType | "");
                    setWindowMinutes("");
                  }}
                >
                  <option value="">— Choisir —</option>
                  {RULE_TYPES.filter((t) => !usedTypes.has(t)).map((t) => (
                    <option key={t} value={t}>
                      {RULE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="grid">
              <span className="lbl">
                {editableType === "HIGH_AMOUNT" ? "Seuil (MAD)" : "Seuil"}
              </span>
              <input
                type="number"
                min="0"
                step={editableType === "HIGH_AMOUNT" ? "0.01" : "1"}
                className="field"
                placeholder={editableType === "HIGH_AMOUNT" ? "10000" : "3"}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </label>

            {showWindow && (
              <label className="grid">
                <span className="lbl">Fenêtre (minutes)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="field"
                  placeholder="60"
                  value={windowMinutes}
                  onChange={(e) => setWindowMinutes(e.target.value)}
                />
              </label>
            )}

            <label className="grid">
              <span className="lbl">Description</span>
              <input
                className="field"
                placeholder="Motif de la règle…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                className="size-4 accent-[var(--color-blue)]"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span className="text-[13px] font-medium text-muted">Règle active</span>
            </label>

            {error && <p className="text-[12.5px] text-red">{error}</p>}

            {editingId && (
              <button type="button" onClick={resetForm} className="btn-quiet flex items-center justify-center gap-1.5">
                <X size={13} />
                Annuler
              </button>
            )}

            <button type="button" onClick={submit} disabled={busy} className="btn">
              {busy ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter la règle"}
            </button>

            <p className="hint">
              Les modifications sont appliquées immédiatement à la détection. Une règle
              désactivée est ignorée ; une règle supprimée revient à sa valeur par défaut.
            </p>
          </div>
        </div>

        <div className="panel scroll">
          <div className="panel-head">
            <span className="text-[15px] font-bold tracking-tight">Règles configurées</span>
            <span className="badge badge-DLT">{configs.length}</span>
          </div>
          {configs.length === 0 ? (
            <p className="empty">Aucune règle configurée pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Règle</th>
                  <th>Description</th>
                  <th className="right">Seuil</th>
                  <th className="right">Fenêtre</th>
                  <th>État</th>
                  <th className="right"></th>
                </tr>
              </thead>
              <tbody>
                {configs.map((c) => (
                  <tr key={c.id}>
                    <td className="font-semibold text-ink">{RULE_TYPE_LABELS[c.ruleType]}</td>
                    <td className="desc">{c.description || "—"}</td>
                    <td className="right mono">{formatThreshold(c)}</td>
                    <td className="right mono">
                      {c.windowMinutes ? `${c.windowMinutes} min` : "—"}
                    </td>
                    <td>
                      <span className={clsx("badge", c.enabled ? "badge-PROCESSED" : "badge-FAILED")}>
                        {c.enabled ? "Active" : "Désactivée"}
                      </span>
                    </td>
                    <td className="right">
                      <span className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void toggle(c)}
                          className="btn-quiet flex items-center gap-1.5"
                          title={c.enabled ? "Désactiver" : "Activer"}
                        >
                          <Power size={12} />
                          {c.enabled ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="btn-quiet flex items-center gap-1.5"
                          title="Modifier"
                        >
                          <Pencil size={12} />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(c)}
                          className="btn-quiet flex items-center gap-1.5"
                          title="Supprimer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}