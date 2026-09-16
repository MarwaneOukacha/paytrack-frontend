"use client";

import { useMemo } from "react";
import { Panel } from "./panel";

export function HourlyChart() {
  const bars = useMemo(() => {
    return Array.from({ length: 24 }, (_, h) =>
      h < 7 ? 2 + Math.random() * 3 : h < 20 ? 4 + Math.random() * 14 : 2 + Math.random() * 4
    );
  }, []);

  const max = Math.max(...bars);
  const peak = bars.indexOf(max);

  return (
    <Panel title={<h2 className="text-sm font-medium">Paiements par heure</h2>}>
      <div className="p-4">
        <div className="flex h-24 items-end gap-[3px]">
          {bars.map((v, h) => (
            <div
              key={h}
              className="flex-1 transition-colors"
              style={{
                height: `${Math.max(4, Math.round((v / max) * 100))}%`,
                background: h === peak ? "var(--color-accent)" : "var(--color-ink)",
              }}
              title={`${h}h — ${Math.round(v)} paiements`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between pt-1 font-mono text-[11px] text-muted">
          <span>00h</span>
          <span>12h</span>
          <span>23h</span>
        </div>
        <p className="mt-3 border-t border-rule pt-2.5 font-mono text-xs text-muted">
          pic d&apos;activité à {peak}h — {Math.round(max)} paiements
        </p>
      </div>
    </Panel>
  );
}