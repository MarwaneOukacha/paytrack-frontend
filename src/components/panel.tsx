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
    <div className={clsx("border border-rule bg-surface", className)}>
      {(title || aside) && (
        <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
          <div>{title}</div>
          {aside}
        </div>
      )}
      {children && <div className={bodyClassName}>{children}</div>}
    </div>
  );
}