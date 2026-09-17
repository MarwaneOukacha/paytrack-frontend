"use client";

import clsx from "clsx";
import type { PaymentStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const STYLES: Record<PaymentStatus, string> = {
  PENDING: "badge-PENDING",
  PROCESSED: "badge-PROCESSED",
  FAILED: "badge-FAILED",
  FRAUD: "badge-FRAUD",
  DLT: "badge-DLT",
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={clsx("badge", STYLES[status])}>{STATUS_LABELS[status]}</span>;
}