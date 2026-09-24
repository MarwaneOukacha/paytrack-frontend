"use client";

import clsx from "clsx";
import { Banknote, ShieldAlert, Wallet, PackageX } from "lucide-react";
import { usePayments } from "./payments-provider";
import { fmtInt, fmtMAD } from "@/lib/format";

export function FiguresRow() {
  const { figures } = usePayments();

  const items = [
    {
      label: "Paiements aujourd'hui",
      value: fmtInt(figures.count),
      delta: "↑ 8,2 %",
      note: "vs hier",
      warn: false,
      tone: "blue",
      Icon: Wallet,
    },
    {
      label: "Montant réglé",
      value: `${fmtMAD(figures.amount)} MAD`,
      delta: "↑ 12,5 %",
      note: "vs hier",
      warn: false,
      tone: "green",
      Icon: Banknote,
    },
    {
      label: "Alertes de fraude",
      value: fmtInt(figures.fraud),
      delta: "↑ 1",
      note: "ce mois-ci",
      warn: true,
      tone: "red",
      Icon: ShieldAlert,
    },
    {
      label: "Dead letters",
      value: fmtInt(figures.dlt),
      delta: null,
      note: "stable",
      warn: false,
      tone: "void",
      Icon: PackageX,
    },
  ];

  return (
    <div className="grid-stats">
      {items.map((it) => {
        const Icon = it.Icon;
        return (
          <div className="card" key={it.label}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="stat-label">{it.label}</div>
                <div className="stat-value">{it.value}</div>
              </div>
              <span className={clsx("stat-chip shrink-0", it.tone)}>
                <Icon size={19} strokeWidth={1.9} />
              </span>
            </div>
            <div className={clsx("stat-delta", it.warn && "warn")}>
              {it.delta ? <b>{it.delta}</b> : null}
              {it.note}
            </div>
          </div>
        );
      })}
    </div>
  );
}