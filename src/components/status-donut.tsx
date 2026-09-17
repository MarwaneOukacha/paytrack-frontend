"use client";

import { usePayments } from "./payments-provider";

type SegKey = "PROCESSED" | "PENDING" | "REJECT" | "DLT";

const SEGMENTS: Array<{ key: SegKey; label: string; color: string }> = [
  { key: "PROCESSED", label: "Réglé", color: "var(--color-green)" },
  { key: "PENDING", label: "En attente", color: "var(--color-amber)" },
  { key: "REJECT", label: "Rejeté / Fraude", color: "var(--color-red)" },
  { key: "DLT", label: "Dead letter", color: "var(--color-void)" },
];

export function StatusDonut() {
  const { history } = usePayments();

  const counts: Record<SegKey, number> = {
    PROCESSED: 0,
    PENDING: 0,
    REJECT: 0,
    DLT: 0,
  };
  history.forEach((p) => {
    if (p.status === "PROCESSED") counts.PROCESSED++;
    else if (p.status === "PENDING") counts.PENDING++;
    else if (p.status === "DLT") counts.DLT++;
    else counts.REJECT++;
  });

  const total = Math.max(1, history.length);
  let acc = 0;
  const segs = SEGMENTS.map((s) => {
    const pct = Math.round((counts[s.key] / total) * 100);
    const len = Math.max(1, pct - 2);
    const rot = acc;
    acc += pct;
    return { ...s, pct, len, rot };
  });

  return (
    <div className="card">
      <div className="card-title">Répartition par statut</div>
      <p className="card-sub">Sur les paiements du jour</p>
      <div className="donut-wrap">
        <svg width="130" height="130" viewBox="0 0 42 42" className="shrink-0">
          <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="var(--color-line)" strokeWidth="5.5" />
          {segs.map((s) => (
            <circle
              key={s.key}
              cx="21"
              cy="21"
              r="15.9"
              fill="transparent"
              stroke={s.color}
              strokeWidth="5.5"
              strokeDasharray={`${s.len} ${100 - s.len}`}
              strokeDashoffset="25"
              strokeLinecap="round"
              transform={`rotate(${s.rot} 21 21)`}
            />
          ))}
        </svg>
        <div className="legend">
          {segs.map((s) => (
            <div key={s.key} className="legend-row">
              <span className="sw" style={{ background: s.color }} />
              {s.label}
              <span className="pct">{s.pct} %</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}