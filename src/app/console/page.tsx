import { FiguresRow } from "@/components/figures-row";
import { FraudBanner } from "@/components/fraud-banner";
import { PaymentForm } from "@/components/payment-form";
import { PaymentFeed } from "@/components/payment-feed";
import { HourlyChart } from "@/components/hourly-chart";

export default function ConsolePage() {
  return (
    <div className="space-y-6">
      <FiguresRow />
      <FraudBanner />
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-6">
          <PaymentForm />
          <HourlyChart />
        </div>
        <PaymentFeed />
      </div>
    </div>
  );
}