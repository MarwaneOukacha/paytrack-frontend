import type { ReactNode } from "react";
import clsx from "clsx";

interface PanelProps {
  children: ReactNode;
  title?: ReactNode;
  aside?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ children, title, aside, className, bodyClassName }: PanelProps) {
  return (
    <div className={clsx("overflow-hidden rounded-[18px] bg-card shadow-card", className)}>
      {(title || aside) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>{title}</div>
          {aside}
        </div>
      )}
      {children && <div className={bodyClassName}>{children}</div>}
    </div>
  );
}