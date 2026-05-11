"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { PanInfo, Variants } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Medal, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PrizeTier = "gold" | "silver" | "bronze" | "honorable";

export type PrizeCardItem = {
  id: string;
  tier: PrizeTier;
  rankLabel: string;
  title: string;
  meta: string;
};

const SWIPE_THRESHOLD_PX = 90;
const SWIPE_VELOCITY = 500;
const NUDGE_DELAY_MS = 750;

type TierStyle = {
  cardBg: string;
  medalBg: string;
  medalFg: string;
  tierBg: string;
  tierFg: string;
  Icon: LucideIcon;
};

const TIERS: Record<PrizeTier, TierStyle> = {
  gold: {
    cardBg: "linear-gradient(160deg,#FFFCEF 0%,#FCEFAC 100%)",
    medalBg: "#FCD466",
    medalFg: "#6E4A09",
    tierBg: "#6E4A09",
    tierFg: "#FFF7DC",
    Icon: Medal,
  },
  silver: {
    cardBg: "linear-gradient(160deg,#F8F9FB 0%,#DCE1E8 100%)",
    medalBg: "#C9D0D8",
    medalFg: "#3A4451",
    tierBg: "#3A4451",
    tierFg: "#F4F6F8",
    Icon: Medal,
  },
  bronze: {
    cardBg: "linear-gradient(160deg,#FFF1E3 0%,#F9D6B0 100%)",
    medalBg: "#D58A4A",
    medalFg: "#FFFFFF",
    tierBg: "#7A4118",
    tierFg: "#FFF1E3",
    Icon: Medal,
  },
  honorable: {
    cardBg: "linear-gradient(160deg,#EFF7FB 0%,#B8E4EF 100%)",
    medalBg: "#B8E4EF",
    medalFg: "#2A4F8A",
    tierBg: "#2A4F8A",
    tierFg: "#EFF7FB",
    Icon: Sparkles,
  },
};

const cardVariants: Variants = {
  enter: { y: 26, scale: 0.92, opacity: 0, rotate: 0 },
  center: { y: 0, scale: 1, opacity: 1, rotate: 0 },
  exit: (dir: number) => ({
    x: 520 * (dir || 1),
    y: -24,
    rotate: 24 * (dir || 1),
    opacity: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  }),
};

export function MatchDeck({ prizes }: { prizes: readonly PrizeCardItem[] }) {
  const [{ index, direction }, setState] = useState({ index: 0, direction: 1 });
  const [interacted, setInteracted] = useState(false);
  const reduce = useReducedMotion();

  const advance = useCallback(
    (dir: number) => {
      setInteracted(true);
      setState((s) => ({
        index: (s.index + 1) % prizes.length,
        direction: dir,
      }));
    },
    [prizes.length],
  );

  const onInteract = useCallback(() => setInteracted(true), []);

  const top = prizes[index];

  return (
    <div className="relative mx-auto h-[290px] w-[240px] sm:h-[330px] sm:w-[270px] lg:h-[360px] lg:w-[290px]">
      <span
        aria-hidden
        className="absolute inset-0 translate-y-[14px] scale-[0.92] rounded-3xl bg-white/25 backdrop-blur-[2px]"
      />
      <span
        aria-hidden
        className="absolute inset-0 translate-y-[7px] scale-[0.96] rounded-3xl bg-white/55 backdrop-blur-[2px]"
      />

      <AnimatePresence initial={false} custom={direction}>
        <Card
          key={top.id}
          card={top}
          direction={direction}
          onSwipe={advance}
          onInteract={onInteract}
          reduce={!!reduce}
          isInitial={!interacted}
        />
      </AnimatePresence>
    </div>
  );
}

function Card({
  card,
  direction,
  onSwipe,
  onInteract,
  reduce,
  isInitial,
}: {
  card: PrizeCardItem;
  direction: number;
  onSwipe: (dir: number) => void;
  onInteract: () => void;
  reduce: boolean;
  isInitial: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-20, 0, 20]);
  const tier = TIERS[card.tier];
  const Icon = tier.Icon;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (
      Math.abs(info.offset.x) > SWIPE_THRESHOLD_PX ||
      Math.abs(info.velocity.x) > SWIPE_VELOCITY
    ) {
      onSwipe(info.offset.x > 0 ? 1 : -1);
    }
  };

  useEffect(() => {
    if (!isInitial || reduce) return;
    const t = window.setTimeout(() => {
      animate(x, [0, 28, -8, 0], {
        duration: 1.1,
        times: [0, 0.35, 0.7, 1],
        ease: [0.4, 0, 0.2, 1],
      });
    }, NUDGE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [isInitial, reduce, x]);

  return (
    <motion.div
      drag={reduce ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={onInteract}
      onDragEnd={onDragEnd}
      style={{ x, rotate, background: tier.cardBg }}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      custom={direction}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="absolute inset-0 flex cursor-grab touch-pan-y flex-col justify-between rounded-3xl border border-white/60 p-5 text-left shadow-[0_30px_64px_-12px_rgba(15,30,60,0.55)] outline-none active:cursor-grabbing sm:p-6"
      aria-label={`Premio ${card.rankLabel}: ${card.title}. Desliza para ver el siguiente.`}
    >
      <div className="flex items-start justify-between">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
          style={{ backgroundColor: tier.medalBg, color: tier.medalFg }}
        >
          <Icon size={22} strokeWidth={2.4} />
        </span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 font-heading text-[10px] font-extrabold uppercase tracking-[0.18em] sm:text-[11px]"
          style={{ backgroundColor: tier.tierBg, color: tier.tierFg }}
        >
          {card.rankLabel}
        </span>
      </div>

      <div>
        <p className="font-heading text-[19px] font-extrabold leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-[21px] lg:text-[23px]">
          {card.title}
        </p>
        <p className="mt-1.5 font-body text-[11px] leading-snug text-[var(--text-secondary)]/75 sm:text-[12px]">
          {card.meta}
        </p>
      </div>

      <div className="text-center font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-primary)]/40 sm:text-[11px]">
        ← Desliza →
      </div>
    </motion.div>
  );
}
