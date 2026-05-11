import type { PrizeCardItem } from "@/components/landing/MatchDeck";

const prizes: readonly PrizeCardItem[] = [
  {
    id: "gold",
    tier: "gold",
    rankLabel: "#1",
    title: "1 año de alquiler pagado",
    meta: "Hasta 12.000€. Tu piso, cubierto 12 meses.",
  },
  {
    id: "silver",
    tier: "silver",
    rankLabel: "#2",
    title: "Mudanza llave en mano + 5.000€",
    meta: "Cajas, transporte, montaje y un extra para amueblar.",
  },
  {
    id: "bronze",
    tier: "bronze",
    rankLabel: "#3",
    title: "3 meses de alquiler",
    meta: "Hasta 3.000€. Empieza un trimestre con todo resuelto.",
  },
  {
    id: "top10",
    tier: "honorable",
    rankLabel: "#4–#10",
    title: "1 mes de alquiler + Pro 1 año",
    meta: "Para los siguientes 7 · ~1.500€ de valor.",
  },
];

export const landing = {
  wordmark: "Match Owner",
  topBadge: "10 premios · 500 plazas",
  eyebrow: "Waitlist privada · 10 ganadores",
  headline: {
    pre: "",
    highlight: "Match Owner",
    post: ": encuentra (o haz que encuentren) tu casa ideal.",
  },
  subhead:
    "Abrimos el beta con 500 plazas. Invita a tus amig@s para subir en la cola — los 10 primeros se llevan premio.",
  deckCaption: "Desliza para ver los premios",
  prizes,
  cta: { label: "Quiero mi sitio", href: "/signup" },
  socialProof: { current: 342, total: 500, suffix: "ya compiten" },
  footer: "© 2026 Match Owner · demo",
};
