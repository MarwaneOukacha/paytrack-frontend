"use client";

const WEEKS = [
  { label: "S12", v: 0.32 },
  { label: "S13", v: 0.55 },
  { label: "S14", v: 0.78 },
  { label: "S15", v: 0.95 },
];

export function WeeklyChart() {
  return (
    <div className="card">
      <div className="card-title">Paiements réglés</div>
      <p className="card-sub">Par semaine, mois en cours</p>
      <div className="bars">
        {WEEKS.map((w) => (
          <div key={w.label} className="bar-col">
            <div className="bar-track">
              <div className="bar" style={{ height: Math.round(w.v * 170) }} />
            </div>
            <span>
              {w.label} 2026
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}