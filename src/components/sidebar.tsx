"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import clsx from "clsx";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import { NAV_GROUPS, NAV_TOP, type NavItem } from "@/lib/nav-config";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["account"]);

  const toggleGroup = (id: string) =>
    setOpenGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const subLink = (item: NavItem) => {
    const active = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={clsx(
          "flex items-center rounded-[10px] px-2.5 py-1.5 text-[13.5px] font-medium text-muted transition-colors hover:bg-page hover:text-ink",
          active && "bg-blue-soft text-blue-dark hover:bg-blue-soft hover:text-blue-dark"
        )}
      >
        {item.label}
      </Link>
    );
  };

  const topLink = (item: NavItem) => {
    const active = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={clsx(
          "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-page hover:text-ink",
          collapsed && "lg:justify-center lg:px-0",
          active && "bg-blue-soft text-blue-dark hover:bg-blue-soft hover:text-blue-dark"
        )}
      >
        <Icon size={18} strokeWidth={1.8} />
        <span className={clsx(collapsed && "lg:hidden")}>{item.label}</span>
      </Link>
    );
  };

  const groupButton = (group: (typeof NAV_GROUPS)[number]) => {
    const open = openGroups.includes(group.id);
    const Icon = group.icon;
    return (
      <Fragment key={group.id}>
        <button
          type="button"
          onClick={() => toggleGroup(group.id)}
          aria-expanded={open}
          className={clsx(
            "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-page hover:text-ink",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <Icon size={18} strokeWidth={1.8} />
          <span className={clsx(collapsed && "lg:hidden")}>{group.label}</span>
          <ChevronRight
            size={15}
            className={clsx(
              "ml-auto text-faint transition-transform duration-150",
              open && "rotate-90",
              collapsed && "lg:hidden"
            )}
          />
        </button>
        <div
          className={clsx(
            "mb-1.5 flex flex-col gap-0.5 border-l border-line pl-3.5 pb-1.5",
            (!open || collapsed) && "hidden lg:hidden"
          )}
        >
          {group.items.map(subLink)}
        </div>
      </Fragment>
    );
  };

  return (
    <aside
      className={clsx(
        "flex flex-col rounded-[18px] bg-card px-3.5 py-5 shadow-card",
        "fixed inset-y-3 left-[-292px] z-50 w-[260px] transition-[left] duration-200",
        mobileOpen && "left-3",
        "lg:static lg:inset-auto lg:z-auto lg:transition-none",
        collapsed ? "lg:w-[76px] lg:px-2.5" : "lg:w-[248px]"
      )}
    >
      <Link href="/console" onClick={onClose} className="flex items-center gap-2.5 px-2 pb-5">
        <span className="grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-blue text-base font-bold text-white">
          P
        </span>
        <span className={clsx("text-[15px] font-bold tracking-tight", collapsed && "lg:hidden")}>
          PayTrack
        </span>
      </Link>

      <div className="nice-scroll flex-1 overflow-y-auto pb-2">
        <div className="flex flex-col gap-0.5">{NAV_TOP.map(topLink)}</div>
        <div className="mx-1.5 my-4 h-px bg-line" />
        <div className="flex flex-col gap-0.5">{NAV_GROUPS.map(groupButton)}</div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 border-t border-line pt-4">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          className="hidden size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-faint hover:text-ink lg:grid"
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>
    </aside>
  );
}