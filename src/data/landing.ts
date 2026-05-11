import type { MatchCardItem } from "@/components/landing/MatchDeck";

const matchCards: readonly MatchCardItem[] = [
  {
    id: "early",
    icon: "rocket",
    label: "Acceso anticipado",
    meta: "Antes que nadie",
  },
  {
    id: "beta",
    icon: "users",
    label: "500 plazas beta",
    meta: "Cupo limitado",
  },
  {
    id: "private",
    icon: "key",
    label: "Invitación privada",
    meta: "Solo por enlace",
  },
  {
    id: "cities",
    icon: "map",
    label: "Por ciudades",
    meta: "Tu ciudad primero",
  },
];

export const landing = {
  wordmark: "Match Owner",
  topBadge: "500 plazas beta",
  eyebrow: "Waitlist · invitación privada",
  headline: {
    pre: "Estás a un paso de entrar al",
    highlight: "primer Match Owner",
    post: ".",
  },
  subhead: "Tu sitio en la cola se gana invitando — no se compra.",
  matchCards,
  cta: {
    label: "Unirme a la waitlist",
    href: "/signup",
  },
  socialProof: {
    current: 342,
    total: 500,
    suffix: "plazas reservadas",
  },
  footer: "© 2026 Match Owner · demo",
};
