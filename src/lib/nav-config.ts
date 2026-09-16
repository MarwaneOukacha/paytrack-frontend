import {
  LayoutDashboard,
  History,
  ShieldAlert,
  Users,
  CreditCard,
  Package,
  Puzzle,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Opérations",
    items: [
      { href: "/console", label: "Console", icon: LayoutDashboard },
      { href: "/history", label: "Historique", icon: History },
      { href: "/fraud", label: "Fraudes", icon: ShieldAlert },
    ],
  },
  {
    label: "Comptes & produits",
    items: [
      { href: "/accounts", label: "Comptes", icon: Users },
      { href: "/soon/cards", label: "Cartes bancaires", icon: CreditCard, soon: true },
      { href: "/soon/products", label: "Produits", icon: Package, soon: true },
    ],
  },
  {
    label: "Système",
    items: [
      { href: "/soon/integrations", label: "Intégrations", icon: Puzzle, soon: true },
      { href: "/soon/settings", label: "Paramètres", icon: Settings, soon: true },
    ],
  },
];

export const SERVICES = [
  { name: "Payment Service", port: 8080 },
  { name: "Fraud Service", port: 8081 },
];