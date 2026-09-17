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
      title={<span className="text-[15px] font-bold tracking-tight">Flux en temps réel</span>}
      aside={<span className="mono text-xs text-muted">{items.length} événements</span>}
      bodyClassName="flex-1 pb-2"
    >
      {items.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">En attente d&apos;événements…</p>
      ) : (
        <ul className="feed nice-scroll max-h-[430px] overflow-y-auto">
          {items.map((it, idx) => (
            <li key={it.ref} className={idx === 0 ? "new" : undefined}>
              <span className="mono text-xs text-muted">{it.time}</span>
              <span className="mono text-[13.5px]">{it.acc}</span>
              <span className="mono ml-auto text-[13.5px] font-semibold tabular-nums">
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