"use client";

import { usePayments } from "./payments-provider";
import { StatusBadge } from "./status-badge";
import { fmtMAD } from "@/lib/format";
import { Panel } from "./panel";

export function PaymentFeed() {
  const { feed, history } = usePayments();
  const items = feed.length > 0 ? feed : history.slice(0, 14);

  return (
    <Panel
      className="flex flex-col"
      title={<h2 className="text-sm font-medium">Flux en temps réel</h2>}
      aside={
        <span className="font-mono text-xs text-muted">
          {items.length} événements
        </span>
      }
      bodyClassName="flex-1"
    >
      {items.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">En attente d&apos;événements…</p>
      ) : (
        <ul className="nice-scroll max-h-[420px] overflow-y-auto">
          {items.map((it, idx) => (
            <li
              key={it.ref}
              className={
                idx === 0
                  ? "push-anim flex items-center gap-3 border-t border-rule px-4 py-2.5 text-sm first:border-t-0"
                  : "flex items-center gap-3 border-t border-rule px-4 py-2.5 text-sm first:border-t-0"
              }
            >
              <span className="hidden shrink-0 font-mono text-xs text-muted sm:inline">
                {it.time}
              </span>
              <span className="shrink-0 font-mono text-sm">{it.acc}</span>
              <span className="ml-auto shrink-0 font-mono tabular-nums">
                {fmtMAD(it.amt)} MAD
              </span>
              <StatusBadge status={it.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}