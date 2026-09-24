export const dynamicParams = false;

const MODULES: Record<string, { title: string; desc: string }> = {
  products: {
    title: "Produits",
    desc: "Catalogue des produits financiers proposés et leurs règles.",
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