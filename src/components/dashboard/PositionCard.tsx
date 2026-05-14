"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";
import { dashboard } from "@/data/dashboard";
import { queueConfig } from "@/lib/mockQueue";

export function PositionCard({ position }: { position: number }) {
  const ahead = Math.max(0, position - 1);
  const fillPct = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((queueConfig.totalSeats - position) / (queueConfig.totalSeats - 1)) *
          100,
      ),
    ),
  );

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-6 text-white shadow-[0_30px_64px_-22px_rgba(15,30,60,0.45)] sm:p-7"
      aria-labelledby="position-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[var(--accent)]/25 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-[var(--secondary)]/25 blur-2xl"
      />

      <div className="relative flex items-center justify-between">
        <p
          id="position-heading"
          className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]"
        >
          {dashboard.position.label}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.18em] ring-1 ring-inset ring-white/15">
          <Crown size={11} className="text-[var(--accent)]" />
          {dashboard.position.prizeNote}
        </span>
      </div>

      <div className="relative mt-3 flex items-end gap-2">
        <span className="font-heading text-[14px] font-semibold text-white/65">
          #
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={position}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="font-heading text-[64px] font-extrabold leading-none tracking-tight sm:text-[76px]"
          >
            {position}
          </motion.span>
        </AnimatePresence>
        <span className="mb-2 font-body text-[13px] text-white/70 sm:text-[14px]">
          {dashboard.position.of(queueConfig.totalSeats)}
        </span>
      </div>

      <div className="relative mt-5">
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${fillPct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 font-body text-[12px] text-white/80 sm:text-[13px]">
          {dashboard.position.progressLabel(ahead)}
        </p>
        <p className="mt-1 font-body text-[10px] text-white/45 sm:text-[11px]">
          {dashboard.position.floorNote}
        </p>
      </div>
    </section>
  );
}
