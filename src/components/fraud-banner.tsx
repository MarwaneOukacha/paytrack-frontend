"use client";

import { AlertTriangle, X } from "lucide-react";
import { usePayments } from "./payments-provider";

export function FraudBanner() {
  const { banner, clearBanner } = usePayments();
  if (!banner) return null;

  return (
    <div className="flex items-center gap-3 border border-alert bg-alert/5 px-4 py-3 font-mono text-xs text-alert sm:text-sm">
      <AlertTriangle size={16} className="shrink-0" />
      <span className="flex-1">{banner}</span>
      <button
        type="button"
        onClick={clearBanner}
        aria-label="Fermer"
        className="grid size-7 shrink-0 place-items-center rounded border border-alert/40 transition-colors hover:bg-alert/10"
      >
        <X size={14} />
      </button>
    </div>
  );
}