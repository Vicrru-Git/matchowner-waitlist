"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

const CYCLE_MS = 2800;

export function MatchDeck({ cards }: { cards: readonly MatchCardItem[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  const advance = useCallback(
    () => setIndex((i) => (i + 1) % cards.length),
    [cards.length],
  );

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(advance, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [advance, reduce]);

  const top = cards[index];
  const TopIcon = ICONS[top.icon];

  return (
    <div className="relative h-[150px] w-[180px] sm:h-[170px] sm:w-[210px]">
      <span
        aria-hidden
        className="absolute inset-0 translate-y-[10px] scale-[0.92] rounded-2xl bg-white/25 backdrop-blur-[2px]"
      />
      <span
        aria-hidden
        className="absolute inset-0 translate-y-[5px] scale-[0.96] rounded-2xl bg-white/55 backdrop-blur-[2px]"
      />

      <AnimatePresence initial={false}>
        <motion.button
          key={top.id}
          type="button"
          onClick={advance}
          aria-label={`${top.label}. Tocar para ver el siguiente.`}
          className="absolute inset-0 flex cursor-pointer flex-col justify-between rounded-2xl border border-white/50 bg-white p-3.5 text-left shadow-[0_20px_44px_-10px_rgba(15,30,60,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:p-4"
          initial={
            reduce
              ? { opacity: 0 }
              : { y: 26, scale: 0.92, opacity: 0, rotate: -4 }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { y: 0, scale: 1, opacity: 1, rotate: 0 }
          }
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.2 } }
              : {
                  x: 360,
                  y: -12,
                  rotate: 20,
                  opacity: 0,
                  transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                }
          }
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
        >
          <div className="flex items-start justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <TopIcon size={18} strokeWidth={2.2} />
            </span>
            <Stamp />
          </div>
          <div>
            <p className="font-heading text-[14px] font-extrabold leading-tight text-[var(--primary)] sm:text-[16px]">
              {top.label}
            </p>
            <p className="mt-1 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]/55 sm:text-[11px]">
              {top.meta}
            </p>
          </div>
        </motion.button>
      </AnimatePresence>
    </div>
  );
}

function Stamp() {
  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0, rotate: -14 }}
      animate={{ scale: 1, opacity: 1, rotate: -14 }}
      transition={{ delay: 0.22, type: "spring", stiffness: 360, damping: 18 }}
      className="inline-flex items-center gap-1 rounded-md border-[1.5px] border-[var(--secondary)] bg-[var(--secondary)]/10 px-2 py-[2px] font-heading text-[9px] font-extrabold uppercase tracking-[0.22em] text-[var(--secondary)] sm:text-[10px]"
    >
      <Check size={11} strokeWidth={3} />
      Match
    </motion.span>
  );
}
