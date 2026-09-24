"use client";

import {
  Clock,
  Eye,
  Info,
  Lock,
  Pause,
  Play,
  ShieldAlert,
  ShieldOff,
  SlidersHorizontal,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import { api, type AccountDto, type CardDto, type CardNumberDto, type CardStatusAction, type LimitConfigDto } from "@/lib/api";
import { CARD_NETWORK_LABELS, CARD_STATUS_LABELS, CARD_TYPE_LABELS } from "@/lib/types";
import type { CardStatus, CardType, CardNetwork } from "@/lib/types";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { fmtMAD } from "@/lib/format";
import CardBrand from "@/components/card-brand";
import Link from "next/link";

const STATUS_BADGE: Record<CardStatus, string> = {
  ACTIVE: "badge-PROCESSED",
  INACTIVE: "badge-DLT",
  BLOCKED: "badge-FAILED",
  EXPIRED: "badge-PENDING",
  LOST: "badge-FAILED",
  STOLEN: "badge-FAILED",
  CANCELLED: "badge-DLT",
};

const splitPan = (pan: string) => pan.replace(/(.{4})/g, "$1 ").trim();

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("fr-MA", { dateStyle: "short", timeStyle: "short" })
    : "—";

export default function CardsPage() {
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [cards, setCards] = useState<CardDto[]>([]);
  const [limitsConfig, setLimitsConfig] = useState<LimitConfigDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // formulaire d'émission
  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState<CardType>("VIRTUAL");
  const [network, setNetwork] = useState<CardNetwork>("VISA");
  const [singleLimit, setSingleLimit] = useState("");
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  // modales
  const [selected, setSelected] = useState<CardDto | null>(null);
  const [revealed, setRevealed] = useState<CardNumberDto | null>(null);
  const [editing, setEditing] = useState<CardDto | null>(null);
  const [editSingle, setEditSingle] = useState("");
  const [editDaily, setEditDaily] = useState("");
  const [editMonthly, setEditMonthly] = useState("");

  useEffect(() => {
    Promise.all([api.accounts(), api.cards(), api.limitConfig()])
      .then(([acc, car, lim]) => {
        setAccounts(acc.content);
        setCards(car.content);
        setLimitsConfig(lim);
        setSingleLimit(String(lim.defaultSingleTransactionLimit));
        setDailyLimit(String(lim.defaultDailyLimit));
        setMonthlyLimit(String(lim.defaultMonthlyLimit));
        const first = acc.content.find((a) => a.status === "ACTIVE" || a.status === "INACTIVE" || a.status === "BLOCKED");
        if (first) setAccountId(first.id);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const page = await api.cards();
    setCards(page.content);
  };

  const emitCard = async () => {
    if (!accountId) {
      setError("Choisissez un compte à associer.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await api.createCard({
        accountId,
        type,
        network,
        singleTransactionLimit: singleLimit.trim() ? parseFloat(singleLimit) : undefined,
        dailyLimit: dailyLimit.trim() ? parseFloat(dailyLimit) : undefined,
        monthlyLimit: monthlyLimit.trim() ? parseFloat(monthlyLimit) : undefined,
      });
      setCards((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setSingleLimit("");
      setDailyLimit("");
      setMonthlyLimit("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Émission de carte impossible.");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (card: CardDto, action: CardStatusAction) => {
    try {
      const updated = await api.setCardStatus(card.id, action);
      setCards((prev) => prev.map((c) => (c.id === card.id ? updated : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Changement de statut impossible.");
    }
  };

  const reveal = async (card: CardDto) => {
    try {
      const data = await api.revealCardNumber(card.id);
      setRevealed(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Révélation du numéro impossible.");
    }
  };

  const saveLimits = async () => {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api.updateCard(editing.id, {
        singleTransactionLimit: editSingle.trim() ? parseFloat(editSingle) : undefined,
        dailyLimit: editDaily.trim() ? parseFloat(editDaily) : undefined,
        monthlyLimit: editMonthly.trim() ? parseFloat(editMonthly) : undefined,
      });
      setCards((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mise à jour des plafonds impossible.");
    } finally {
      setBusy(false);
    }
  };

  const cancelCard = async (card: CardDto) => {
    if (!window.confirm(`Annuler définitivement la carte ${card.cardNumber} ?`)) return;
    try {
      await api.deleteCard(card.id);
      setCards((prev) => prev.filter((c) => c.id !== card.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Annulation de carte impossible.");
    }
  };

  const openLimits = (card: CardDto) => {
    setEditing(card);
    setEditSingle(card.singleTransactionLimit != null ? String(card.singleTransactionLimit) : "");
    setEditDaily(card.dailyLimit != null ? String(card.dailyLimit) : "");
    setEditMonthly(card.monthlyLimit != null ? String(card.monthlyLimit) : "");
    setError("");
  };

  if (loading) {
    return <div className="card empty">Chargement des cartes…</div>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Cartes bancaires</h1>
          <p>Émission, plafonds et cycle de vie des cartes liées aux comptes PayTrack</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="panel">
          <div className="panel-head">
            <span className="text-[15px] font-bold tracking-tight">Émettre une carte</span>
          </div>
          <div className="flex flex-col gap-3.5 p-5">
            <label className="grid">
              <span className="lbl">Compte</span>
              <select className="field" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">— Choisir —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountNumber} · {a.ownerName}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid">
                <span className="lbl">Type</span>
                <select className="field" value={type} onChange={(e) => setType(e.target.value as CardType)}>
                  <option value="VIRTUAL">Virtuelle</option>
                  <option value="PHYSICAL">Physique</option>
                </select>
              </label>
              <label className="grid">
                <span className="lbl">Réseau</span>
                <select className="field" value={network} onChange={(e) => setNetwork(e.target.value as CardNetwork)}>
                  <option value="VISA">Visa</option>
                  <option value="MASTERCARD">Mastercard</option>
                </select>
              </label>
            </div>

            <label className="grid">
              <span className="lbl">Plafond par opération (MAD)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field"
                placeholder={limitsConfig ? String(limitsConfig.defaultSingleTransactionLimit) : "10000"}
                value={singleLimit}
                onChange={(e) => setSingleLimit(e.target.value)}
              />
            </label>

            <label className="grid">
              <span className="lbl">Plafond journalier (MAD)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field"
                placeholder={limitsConfig ? String(limitsConfig.defaultDailyLimit) : "30000"}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
              />
            </label>

            <label className="grid">
              <span className="lbl">Plafond mensuel (MAD)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field"
                placeholder={limitsConfig ? String(limitsConfig.defaultMonthlyLimit) : "150000"}
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </label>

            {error && <p className="text-[12.5px] text-red">{error}</p>}

            <button type="button" onClick={() => void emitCard()} disabled={busy} className="btn">
              {busy ? "Émission…" : "Émettre la carte"}
            </button>
            <p className="hint">
              Une carte <span className="font-semibold text-ink">VISA</span> ou{" "}
              <span className="font-semibold text-ink">Mastercard</span> est générée (PAN valide au format
              Luhn). Un seul type de carte actif par compte. Les plafonds ci-dessus sont pré-remplis depuis{" "}
              <Link href="/limits" className="font-semibold text-blue underline">
                les configs compte
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="panel scroll">
          <div className="panel-head">
            <span className="text-[15px] font-bold tracking-tight">Cartes émises</span>
            <span className="badge badge-DLT">{cards.length}</span>
          </div>
          {cards.length === 0 ? (
            <p className="empty">Aucune carte émise pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Réseau</th>
                  <th>Type</th>
                  <th>Titulaire</th>
                  <th>Compte</th>
                  <th>Expire</th>
                  <th>État</th>
                  <th className="right">Plafonds</th>
                  <th className="right"></th>
                </tr>
              </thead>
              <tbody>
                {cards.map((c) => {
                  const cancelled = c.status === "CANCELLED";
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="cursor-pointer"
                    >
                      <td className="mono">{c.cardNumber}</td>
                      <td className="font-medium">{CARD_NETWORK_LABELS[c.network]}</td>
                      <td>{CARD_TYPE_LABELS[c.type]}</td>
                      <td className="desc">{c.cardholderName}</td>
                      <td className="mono">{c.accountNumber}</td>
                      <td className="mono">
                        {c.expiryMonth}/{c.expiryYear.slice(2)}
                      </td>
                      <td>
                        <span className={clsx("badge", STATUS_BADGE[c.status])}>
                          {CARD_STATUS_LABELS[c.status]}
                        </span>
                      </td>
                      <td className="right mono text-xs text-muted">
                        {fmtMAD(c.singleTransactionLimit ?? 0)}
                        <span className="text-faint"> / </span>
                        {fmtMAD(c.dailyLimit ?? 0)}
                        <span className="text-faint"> / </span>
                        {fmtMAD(c.monthlyLimit ?? 0)} MAD
                      </td>
                      <td className="right" onClick={(e) => e.stopPropagation()}>
                        {!cancelled && (
                          <span className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelected(c)}
                              className="btn-quiet flex items-center gap-1.5"
                              title="Voir les détails"
                            >
                              <Info size={12} />
                            </button>
                            {c.status === "BLOCKED" && (
                              <button
                                type="button"
                                onClick={() => void setStatus(c, "unblock")}
                                className="btn-quiet flex items-center gap-1.5"
                                title="Débloquer"
                              >
                                <Unlock size={12} />
                                Débloquer
                              </button>
                            )}
                            {c.status === "ACTIVE" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void setStatus(c, "block")}
                                  className="btn-quiet flex items-center gap-1.5"
                                  title="Bloquer"
                                >
                                  <Lock size={12} />
                                  Bloquer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void setStatus(c, "deactivate")}
                                  className="btn-quiet flex items-center gap-1.5"
                                  title="Désactiver"
                                >
                                  <Pause size={12} />
                                </button>
                              </>
                            )}
                            {c.status === "INACTIVE" && (
                              <button
                                type="button"
                                onClick={() => void setStatus(c, "activate")}
                                className="btn-quiet flex items-center gap-1.5"
                                title="Activer"
                              >
                                <Play size={12} />
                                Activer
                              </button>
                            )}
                            {c.status === "ACTIVE" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void setStatus(c, "lost")}
                                  className="btn-quiet flex items-center gap-1.5"
                                  title="Déclarer perdue"
                                >
                                  <ShieldOff size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void setStatus(c, "stolen")}
                                  className="btn-quiet flex items-center gap-1.5"
                                  title="Déclarer volée"
                                >
                                  <ShieldAlert size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void setStatus(c, "expire")}
                                  className="btn-quiet flex items-center gap-1.5"
                                  title="Marquer expirée"
                                >
                                  <Clock size={12} />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => reveal(c)}
                              className="btn-quiet flex items-center gap-1.5"
                              title="Voir le numéro complet"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openLimits(c)}
                              className="btn-quiet flex items-center gap-1.5"
                              title="Modifier les plafonds"
                            >
                              <SlidersHorizontal size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void cancelCard(c)}
                              className="btn-quiet flex items-center gap-1.5"
                              title="Annuler définitivement"
                            >
                              <Trash2 size={12} />
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {revealed && (
        <div className="modal-backdrop" onClick={() => setRevealed(null)}>
          <div className="modal-panel max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold tracking-tight">Numéro complet</h2>
              <button type="button" onClick={() => setRevealed(null)} className="btn-quiet" aria-label="Fermer">
                <X size={14} />
              </button>
            </div>
            <p className="mt-1 text-[12.5px] text-red">
              Données sensibles : stockez-les de façon sécurisée. Ne les partagez jamais.
            </p>

            <div className="mt-4 rounded-[14px] bg-page p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold">{CARD_NETWORK_LABELS[revealed.network]} · {CARD_TYPE_LABELS[revealed.type]}</span>
                <CardBrand network={revealed.network} className="h-5" />
              </div>
              <p className="mono mt-3 text-lg leading-relaxed tracking-wide">{splitPan(revealed.cardNumber)}</p>
              <div className="mono mt-3 flex gap-6 text-sm text-muted">
                <span>
                  Expire <b className="text-ink">{revealed.expiryMonth}/{revealed.expiryYear.slice(2)}</b>
                </span>
                <span>
                  CVV <b className="text-ink">{revealed.cvv}</b>
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(revealed.cardNumber)}
                className="btn"
              >
                Copier le numéro
              </button>
              <button type="button" onClick={() => setRevealed(null)} className="btn-quiet flex-1">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div
            className="modal-panel max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold tracking-tight">Plafonds de la carte</h2>
              <button type="button" onClick={() => setEditing(null)} className="btn-quiet" aria-label="Fermer">
                <X size={14} />
              </button>
            </div>
            <p className="mt-1 text-[12.5px] text-muted">
              {editing.cardNumber} · champs vides = conservés
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <label className="grid">
                <span className="lbl">Plafond par opération (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={editSingle} onChange={(e) => setEditSingle(e.target.value)} />
              </label>
              <label className="grid">
                <span className="lbl">Plafond journalier (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={editDaily} onChange={(e) => setEditDaily(e.target.value)} />
              </label>
              <label className="grid">
                <span className="lbl">Plafond mensuel (MAD)</span>
                <input type="number" min="0" step="0.01" className="field" value={editMonthly} onChange={(e) => setEditMonthly(e.target.value)} />
              </label>
            </div>

            {error && <p className="mt-3 text-[12.5px] text-red">{error}</p>}

            <div className="mt-4 flex gap-2.5">
              <button type="button" onClick={() => void saveLimits()} disabled={busy} className="btn">
                {busy ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn-quiet flex-1">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal-panel max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold tracking-tight">Détails de la carte</h2>
              <button type="button" onClick={() => setSelected(null)} className="btn-quiet" aria-label="Fermer">
                <X size={14} />
              </button>
            </div>

            <div
              className={clsx(
                "relative mt-4 overflow-hidden rounded-[16px] p-5 text-white",
                selected.network === "MASTERCARD"
                  ? "bg-gradient-to-br from-[#1a1b22] via-[#2b2e38] to-[#4a4e5c]"
                  : "bg-gradient-to-br from-[#12205e] via-[#243b7e] to-[#2f6fed]"
              )}
            >
              <div className="flex items-center justify-between text-[13px] font-semibold">
                <span>{CARD_NETWORK_LABELS[selected.network]}</span>
                <CardBrand network={selected.network} variant="light" className="h-6" />
              </div>
              <p className="mono mt-7 text-lg tracking-[0.12em]">{selected.cardNumber}</p>
              <div className="mono mt-6 flex items-end justify-between text-sm">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/60">Titulaire</span>
                  <span className="font-semibold">{selected.cardholderName}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-white/60">Expire</span>
                  <span className="font-semibold">
                    {selected.expiryMonth}/{selected.expiryYear.slice(2)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-white/70">
                  {CARD_TYPE_LABELS[selected.type]}
                </span>
                <span className="badge bg-black/25 text-white">
                  {CARD_STATUS_LABELS[selected.status]}
                </span>
              </div>
              <span className="absolute -bottom-8 -right-8 size-32 rounded-full bg-white/10" />
              <span className="absolute -bottom-4 -right-2 size-16 rounded-full bg-white/10" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
              <div>
                <span className="block text-muted">Compte</span>
                <span className="mono font-semibold">{selected.accountNumber}</span>
              </div>
              <div>
                <span className="block text-muted">Devise</span>
                <span className="font-semibold">{selected.currency ?? "MAD"}</span>
              </div>
              <div>
                <span className="block text-muted">Réseau</span>
                <span className="font-semibold">{CARD_NETWORK_LABELS[selected.network]}</span>
              </div>
              <div>
                <span className="block text-muted">Type</span>
                <span className="font-semibold">{CARD_TYPE_LABELS[selected.type]}</span>
              </div>
              <div>
                <span className="block text-muted">Émise le</span>
                <span className="font-semibold">{fmtDate(selected.issuedAt)}</span>
              </div>
              <div>
                <span className="block text-muted">Mise à jour</span>
                <span className="font-semibold">{fmtDate(selected.updatedAt)}</span>
              </div>
              <div>
                <span className="block text-muted">Plafond / opération</span>
                <span className="mono font-semibold">{fmtMAD(selected.singleTransactionLimit ?? 0)} MAD</span>
              </div>
              <div>
                <span className="block text-muted">Plafond journalier</span>
                <span className="mono font-semibold">{fmtMAD(selected.dailyLimit ?? 0)} MAD</span>
              </div>
              <div>
                <span className="block text-muted">Plafond mensuel</span>
                <span className="mono font-semibold">{fmtMAD(selected.monthlyLimit ?? 0)} MAD</span>
              </div>
            </div>

            {selected.status !== "CANCELLED" && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                {selected.status === "BLOCKED" && (
                  <button
                    type="button"
                    onClick={() => {
                      void setStatus(selected, "unblock");
                      setSelected(null);
                    }}
                    className="btn-quiet flex items-center gap-1.5"
                  >
                    <Unlock size={12} />
                    Débloquer
                  </button>
                )}
                {selected.status === "ACTIVE" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        void setStatus(selected, "block");
                        setSelected(null);
                      }}
                      className="btn-quiet flex items-center gap-1.5"
                    >
                      <Lock size={12} />
                      Bloquer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void setStatus(selected, "deactivate");
                        setSelected(null);
                      }}
                      className="btn-quiet flex items-center gap-1.5"
                    >
                      <Pause size={12} />
                      Désactiver
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void setStatus(selected, "lost");
                        setSelected(null);
                      }}
                      className="btn-quiet flex items-center gap-1.5"
                    >
                      <ShieldOff size={12} />
                      Perdue
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void setStatus(selected, "stolen");
                        setSelected(null);
                      }}
                      className="btn-quiet flex items-center gap-1.5"
                    >
                      <ShieldAlert size={12} />
                      Volée
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void setStatus(selected, "expire");
                        setSelected(null);
                      }}
                      className="btn-quiet flex items-center gap-1.5"
                    >
                      <Clock size={12} />
                      Expirer
                    </button>
                  </>
                )}
                {selected.status === "INACTIVE" && (
                  <button
                    type="button"
                    onClick={() => {
                      void setStatus(selected, "activate");
                      setSelected(null);
                    }}
                    className="btn-quiet flex items-center gap-1.5"
                  >
                    <Play size={12} />
                    Activer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    reveal(selected);
                    setSelected(null);
                  }}
                  className="btn-quiet flex items-center gap-1.5"
                >
                  <Eye size={12} />
                  Voir le numéro
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openLimits(selected);
                    setSelected(null);
                  }}
                  className="btn-quiet flex items-center gap-1.5"
                >
                  <SlidersHorizontal size={12} />
                  Plafonds
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void cancelCard(selected);
                    setSelected(null);
                  }}
                  className="btn-quiet flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Annuler la carte
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}