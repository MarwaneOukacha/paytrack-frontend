"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import clsx from "clsx";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import { NAV_GROUPS, NAV_TOP, type NavItem } from "@/lib/nav-config";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

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

  const isActive = (href: string) => pathname === href;

  const subLink = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={clsx(
          "relative flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[13.5px] font-medium text-muted transition-all duration-150 hover:bg-page hover:text-ink",
          active && "bg-blue-soft font-semibold text-blue-dark hover:bg-blue-soft hover:text-blue-dark"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-[14px] w-[3px] -translate-y-1/2 rounded-full bg-blue" />
        )}
        {item.label}
      </Link>
    );
  };

  const topLink = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={clsx(
          "relative flex w-full items-center gap-3 rounded-[11px] px-2.5 py-2 text-sm font-medium text-muted transition-all duration-150 hover:bg-page hover:text-ink",
          collapsed && "lg:justify-center lg:px-0",
          active &&
            "bg-gradient-to-r from-blue-soft to-transparent text-blue-dark shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-blue)_14%,transparent)] hover:bg-gradient-to-r hover:from-blue-soft hover:to-transparent hover:text-blue-dark"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-full bg-blue" />
        )}
        <Icon size={18} strokeWidth={1.9} className={clsx(active && "text-blue")} />
        <span className={clsx(collapsed && "lg:hidden")}>{item.label}</span>
      </Link>
    );
  };

  const groupButton = (group: (typeof NAV_GROUPS)[number]) => {
    const open = openGroups.includes(group.id);
    const Icon = group.icon;
    const groupActive = group.items.some((i) => isActive(i.href));
    return (
      <Fragment key={group.id}>
        <button
          type="button"
          onClick={() => toggleGroup(group.id)}
          aria-expanded={open}
          className={clsx(
            "flex w-full items-center gap-3 rounded-[11px] px-2.5 py-2 text-left text-sm font-medium transition-all duration-150 hover:bg-page",
            collapsed && "lg:justify-center lg:px-0",
            groupActive ? "text-ink" : "text-muted"
          )}
        >
          <Icon size={18} strokeWidth={1.9} className={clsx(groupActive && "text-blue")} />
          <span className={clsx("flex-1", collapsed && "lg:hidden")}>{group.label}</span>
          <ChevronRight
            size={15}
            className={clsx(
              "text-faint transition-transform duration-150",
              open && "rotate-90 text-muted",
              collapsed && "lg:hidden"
            )}
          />
        </button>
        <div
          className={clsx(
            "mb-2 ml-[15px] flex flex-col gap-0.5 border-l border-line pl-3 pb-1",
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
        "relative flex flex-col overflow-hidden rounded-[18px] border border-line bg-card shadow-card",
        "fixed inset-y-3 left-[-292px] z-50 w-[260px] transition-[left] duration-200",
        mobileOpen && "left-3",
        "lg:static lg:inset-auto lg:z-auto lg:transition-none",
        collapsed ? "lg:w-[76px] lg:px-2.5" : "lg:w-[248px]"
      )}
    >
      <span className="pointer-events-none absolute -top-16 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-blue/10 blur-3xl" />

      <Link
        href="/console"
        onClick={onClose}
        className="flex items-center gap-3 px-3 pb-5 pt-3"
      >
        <span className="relative grid size-[38px] shrink-0 place-items-center overflow-hidden rounded-[11px] bg-gradient-to-br from-blue via-blue-dark to-[#5b21b6] text-base font-bold text-white shadow-glow ring-1 ring-inset ring-white/25">
          <span className="absolute -right-1.5 -top-1.5 size-5 rounded-full bg-white/25" />
          <span className="relative">P</span>
        </span>
        <span className={clsx("flex flex-col", collapsed && "lg:hidden")}>
          <span className="text-[15px] font-bold leading-tight tracking-tight">PayTrack</span>
          <span className="text-[11px] font-medium text-faint">Console des paiements</span>
        </span>
      </Link>

      <div className="nice-scroll relative flex-1 overflow-y-auto pb-2">
        <div className="flex flex-col gap-0.5">{NAV_TOP.map(topLink)}</div>
        <div className="mx-2 my-4 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
        <div className="flex flex-col gap-0.5">{NAV_GROUPS.map(groupButton)}</div>
      </div>

      <div className="relative mt-4 flex flex-col gap-3 border-t border-line bg-page/40 p-3">
        <UserMenu collapsed={collapsed} />
        <div className="flex items-center justify-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
            className="hidden size-9 place-items-center rounded-full border border-line bg-card text-muted shadow-card transition-colors hover:border-faint hover:text-ink lg:grid"
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
      </div>
    </aside>
  );
}