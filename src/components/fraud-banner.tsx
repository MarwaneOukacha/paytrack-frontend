"use client";

import { AlertTriangle, X } from "lucide-react";
import { usePayments } from "./payments-provider";

export function FraudBanner() {
  const { banner, clearBanner } = usePayments();
  if (!banner) return null;

  return (
    <div className="alert-card mb-4 flex items-center gap-3">
      <AlertTriangle size={16} className="shrink-0 text-red" />
      <span className="flex-1 text-sm font-medium text-red">{banner}</span>
      <button
        type="button"
        onClick={clearBanner}
        aria-label="Fermer"
        className="grid size-7 shrink-0 place-items-center rounded border border-red/40 text-red transition-colors hover:bg-red/10"
      >
        <X size={14} />
      </button>
    </div>
  );
}