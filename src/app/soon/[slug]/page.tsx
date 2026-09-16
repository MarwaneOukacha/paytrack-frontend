import { Rocket } from "lucide-react";

export const dynamicParams = false;

const MODULES: Record<
  string,
  { title: string; desc: string }
> = {
  cards: {
    title: "Cartes bancaires",
    desc: "Émission, activation et plafonds de cartes liées à un compte PayTrack.",
  },
  products: {
    title: "Produits",
    desc: "Catalogue des produits financiers proposés et leurs règles.",
  },
  integrations: {
    title: "Intégrations",
    desc: "Connexions vers les systèmes bancaires externes : ISO 20022, USSD, SMPP.",
  },
  settings: {
    title: "Paramètres",
    desc: "Seuils de fraude, plafonds de paiement, origines autorisées.",
  },
};

export function generateStaticParams() {
  return Object.keys(MODULES).map((slug) => ({ slug }));
}

export default async function SoonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = MODULES[slug];
  if (!mod) return null;

  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-full max-w-md border border-rule bg-surface px-6 py-14 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full border border-rule">
          <Rocket size={20} className="text-muted" />
        </span>
        <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted">Bientôt</p>
        <h1 className="mt-2 text-xl font-bold tracking-tight">{mod.title}</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">{mod.desc}</p>
      </div>
    </div>
  );
}