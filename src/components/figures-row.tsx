"use client";

import clsx from "clsx";
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
    },
    {
      label: "Montant réglé",
      value: `${fmtMAD(figures.amount)} MAD`,
      delta: "↑ 12,5 %",
      note: "vs hier",
      warn: false,
    },
    {
      label: "Alertes de fraude",
      value: fmtInt(figures.fraud),
      delta: "↑ 1",
      note: "ce mois-ci",
      warn: true,
    },
    {
      label: "Dead letters",
      value: fmtInt(figures.dlt),
      delta: null,
      note: "stable",
      warn: false,
    },
  ];

  return (
    <div className="grid-stats">
      {items.map((it) => (
        <div className="card" key={it.label}>
          <div className="stat-label">{it.label}</div>
          <div className="stat-value">{it.value}</div>
          <div className={clsx("stat-delta", it.warn && "warn")}>
            {it.delta ? <b>{it.delta}</b> : null}
            {it.note}
          </div>
        </div>
      ))}
    </div>
  );
}