"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { PanInfo, Variants } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Check, KeyRound, MapPin, Rocket, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  users: Users,
  key: KeyRound,
  map: MapPin,
};

export type MatchCardItem = {
  id: string;
  icon: "rocket" | "users" | "key" | "map";
  label: string;
  meta: string;
};

const CYCLE_MS = 3400;
const SWIPE_THRESHOLD_PX = 90;
const SWIPE_VELOCITY = 500;

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

export function MatchDeck({ cards }: { cards: readonly MatchCardItem[] }) {
  const [{ index, direction }, setState] = useState({ index: 0, direction: 1 });
  const reduce = useReducedMotion();

  const advance = useCallback(
    (dir: number) =>
      setState((s) => ({
        index: (s.index + 1) % cards.length,
        direction: dir,
      })),
    [cards.length],
  );

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => advance(1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [advance, reduce]);

  const top = cards[index];

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
          reduce={!!reduce}
        />
      </AnimatePresence>
    </div>
  );
}

function Card({
  card,
  direction,
  onSwipe,
  reduce,
}: {
  card: MatchCardItem;
  direction: number;
  onSwipe: (dir: number) => void;
  reduce: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-20, 0, 20]);
  const Icon = ICONS[card.icon];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (
      Math.abs(info.offset.x) > SWIPE_THRESHOLD_PX ||
      Math.abs(info.velocity.x) > SWIPE_VELOCITY
    ) {
      onSwipe(info.offset.x > 0 ? 1 : -1);
    }
  };

  return (
    <motion.div
      drag={reduce ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      style={{ x, rotate }}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      custom={direction}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="absolute inset-0 flex cursor-grab touch-pan-y flex-col justify-between rounded-3xl border border-white/55 bg-white p-5 text-left shadow-[0_30px_64px_-12px_rgba(15,30,60,0.55)] outline-none active:cursor-grabbing sm:p-6"
      aria-label={`${card.label}. Desliza a la derecha o a la izquierda para ver la siguiente plaza.`}
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] sm:h-12 sm:w-12">
          <Icon size={22} strokeWidth={2.2} />
        </span>
        <Stamp />
      </div>
      <div>
        <p className="font-heading text-[22px] font-extrabold leading-[1.08] text-[var(--primary)] sm:text-[24px] lg:text-[26px]">
          {card.label}
        </p>
        <p className="mt-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]/55 sm:text-[12px]">
          {card.meta}
        </p>
      </div>
      <div className="text-center font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--primary)]/35 sm:text-[11px]">
        ← Desliza →
      </div>
    </motion.div>
  );
}

function Stamp() {
  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0, rotate: -14 }}
      animate={{ scale: 1, opacity: 1, rotate: -14 }}
      transition={{ delay: 0.22, type: "spring", stiffness: 360, damping: 18 }}
      className="inline-flex items-center gap-1 rounded-md border-[1.5px] border-[var(--secondary)] bg-[var(--secondary)]/10 px-2 py-[2px] font-heading text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--secondary)] sm:text-[11px]"
    >
      <Check size={11} strokeWidth={3} />
      Match
    </motion.span>
  );
}
