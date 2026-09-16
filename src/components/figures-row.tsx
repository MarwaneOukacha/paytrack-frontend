"use client";

import { Activity, Banknote, CheckCircle2, MailX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePayments } from "./payments-provider";
import { fmtInt, fmtMAD } from "@/lib/format";

interface Figure {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "neutral" | "accent" | "alert" | "void";
}

const TONES: Record<Figure["tone"], string> = {
  neutral: "text-muted",
  accent: "text-accent dark:text-dark-accent",
  alert: "text-alert",
  void: "text-void",
};

export function FiguresRow() {
  const { figures } = usePayments();

  const items: Figure[] = [
    {
      label: "Paiements du jour",
      value: fmtInt(figures.count),
      icon: Activity,
      tone: "neutral",
    },
    {
      label: "Réglé aujourd'hui",
      value: fmtMAD(figures.amount) + " MAD",
      icon: Banknote,
      tone: "accent",
    },
    {
      label: "Fraudes",
      value: fmtInt(figures.fraud),
      icon: Activity,
      tone: figures.fraud > 0 ? "alert" : "neutral",
    },
    {
      label: "Dead letters",
      value: fmtInt(figures.dlt),
      icon: MailX,
      tone: figures.dlt > 0 ? "void" : "neutral",
    },
  ];

  return (
    <div className="border border-rule bg-surface">
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <h1 className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
          <CheckCircle2 size={16} className="text-accent dark:text-dark-accent" />
          Console des paiements
        </h1>
        <span className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-accent dark:bg-dark-accent" />
          </span>
          flux en direct
        </span>
      </div>

      <dl className="grid grid-cols-2 divide-rule md:grid-cols-4 md:divide-x">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="border-t border-rule px-4 py-3.5 md:border-t-0">
              <dt className="flex items-center gap-1.5 text-xs text-muted">
                <Icon size={13} className={TONES[it.tone]} />
                {it.label}
              </dt>
              <dd
                className={`mt-1.5 font-mono text-xl font-medium tabular-nums tracking-tight ${
                  it.tone === "alert"
                    ? "text-alert"
                    : it.tone === "accent"
                      ? "text-accent dark:text-dark-accent"
                      : ""
                }`}
              >
                {it.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}