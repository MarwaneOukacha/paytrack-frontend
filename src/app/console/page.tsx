import { Calendar, Filter, X } from "lucide-react";
import { FiguresRow } from "@/components/figures-row";
import { FraudBanner } from "@/components/fraud-banner";
import { PaymentForm } from "@/components/payment-form";
import { PaymentFeed } from "@/components/payment-feed";
import { WeeklyChart } from "@/components/weekly-chart";
import { StatusDonut } from "@/components/status-donut";

export default function ConsolePage() {
  return (
    <div className="space-y-4">
      <div className="page-head">
        <div>
          <h1>Console : Vue d&apos;ensemble</h1>
          <p>Suivez les paiements et les alertes de fraude en temps réel</p>
        </div>
        <span className="status-pill">
          <span className="dot" />
          Flux en direct
        </span>
      </div>

      <div className="toolbar">
        <button className="pill primary">
          <Filter size={13} />
          Filtres
          <span className="opacity-70">▾</span>
        </button>
        <span className="pill">
          Compte : Tous <X size={12} className="x" />
        </span>
        <span className="pill">
          Statut : Tous <X size={12} className="x" />
        </span>
        <span className="pill ml-auto">
          <Calendar size={13} />
          Aujourd&apos;hui
        </span>
      </div>

      <FiguresRow />
      <FraudBanner />

      <div className="grid-charts">
        <WeeklyChart />
        <StatusDonut />
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <PaymentForm />
        <PaymentFeed />
      </div>
    </div>
  );
}