export const dynamicParams = false;

const MODULES: Record<string, { title: string; desc: string }> = {
  cards: {
    title: "Cartes bancaires",
    desc: "Émission, activation et plafonds de cartes liées à un compte PayTrack.",
  },
  products: {
    title: "Produits",
    desc: "Catalogue des produits financiers proposés et leurs règles.",
  },
  limits: {
    title: "Plafonds & configs compte",
    desc: "Plafonds de paiement, devises autorisées, paramètres par défaut à l'ouverture.",
  },
  integrations: {
    title: "Intégrations",
    desc: "Connexions vers les systèmes bancaires externes : ISO 20022, USSD, SMPP.",
  },
  settings: {
    title: "Paramètres",
    desc: "Seuils de fraude, plafonds de paiement, origines autorisées.",
  },
  logs: {
    title: "Journaux API",
    desc: "Historique des appels REST vers payment-service et fraud-service.",
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
    <div className="card">
      <div className="soon-page">
        <span className="eyebrow">Bientôt</span>
        <h1>{mod.title}</h1>
        <p className="desc">{mod.desc}</p>
      </div>
    </div>
  );
}