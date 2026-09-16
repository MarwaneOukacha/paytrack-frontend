"use client";

import clsx from "clsx";
import type { PaymentStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const STYLES: Record<PaymentStatus, string> = {
  PENDING: "text-pending border-pending bg-pending-soft",
  PROCESSED: "text-accent border-accent bg-accent-soft",
  FAILED: "text-alert border-alert bg-alert-soft",
  FRAUD: "text-alert border-alert bg-alert-soft",
  DLT: "text-void border-void bg-void-soft",
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}