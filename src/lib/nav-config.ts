import {
  LayoutDashboard,
  History,
  ShieldAlert,
  Users,
  CreditCard,
  Package,
  Gauge,
  Shield,
  Plug,
  Settings,
  FileCode2,
  ClipboardList,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const NAV_TOP: NavItem[] = [
  { href: "/console", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Paiements", icon: History },
  { href: "/fraud", label: "Fraudes", icon: ShieldAlert },
  { href: "/accounts", label: "Comptes", icon: Users },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "workflows",
    label: "Workflows",
    icon: Workflow,
    items: [{ href: "/fraud-configuration", label: "Règles de fraude", icon: Shield }],
  },
  {
    id: "account",
    label: "Configs compte",
    icon: ClipboardList,
    items: [
      { href: "/soon/cards", label: "Cartes bancaires", icon: CreditCard },
      { href: "/soon/products", label: "Produits", icon: Package },
      { href: "/soon/limits", label: "Plafonds & configs", icon: Gauge },
    ],
  },
  {
    id: "system",
    label: "Configs système",
    icon: Settings,
    items: [
      { href: "/soon/integrations", label: "Intégrations", icon: Plug },
      { href: "/soon/settings", label: "Paramètres", icon: Settings },
    ],
  },
  {
    id: "logs",
    label: "Journaux API",
    icon: FileCode2,
    items: [{ href: "/soon/logs", label: "API Logs", icon: FileCode2 }],
  },
];