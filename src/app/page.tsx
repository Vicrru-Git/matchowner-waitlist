"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { landing } from "@/data/landing";
import { MatchDeck } from "@/components/landing/MatchDeck";

export default function Page() {
  const proofPct = Math.round(
    (landing.socialProof.current / landing.socialProof.total) * 100,
  );

  return (
    <main
      className="grid h-[100svh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[var(--primary)] text-white"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 28%, rgba(184,228,239,0.22) 0%, rgba(53,99,174,0) 60%), radial-gradient(circle at 92% 0%, rgba(237,92,45,0.18) 0%, transparent 42%)",
      }}
    >
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 pt-3 sm:px-8 sm:pt-5">
        <span className="font-heading text-[15px] font-extrabold tracking-tight sm:text-[17px]">
          {landing.wordmark}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset ring-white/20 backdrop-blur-sm sm:text-[11px]">
          <Sparkles size={11} className="text-[var(--accent)]" />
          {landing.topBadge}
        </span>
      </header>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full min-h-0 max-w-[1180px] flex-col px-5 pb-2 pt-3 sm:px-8 sm:pb-3 sm:pt-4"
      >
        <div className="flex min-h-0 w-full flex-1 flex-col justify-between gap-3 sm:gap-4 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_auto] lg:items-center lg:justify-stretch lg:gap-x-12 lg:gap-y-5">
          <motion.div
            variants={fadeInUp}
            className="flex w-full max-w-[520px] flex-col items-center self-center text-center lg:col-start-1 lg:row-start-1 lg:max-w-none lg:items-start lg:justify-end lg:self-end lg:text-left"
          >
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] sm:text-[11px]">
              {landing.eyebrow}
            </p>

            <h1 className="mt-2 font-heading text-[22px] font-extrabold leading-[1.08] tracking-tight sm:mt-3 sm:text-[32px] lg:text-[44px]">
              {landing.headline.pre && <>{landing.headline.pre} </>}
              <span className="relative inline-block">
                <span className="text-[var(--secondary)]">
                  {landing.headline.highlight}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-[4px] rounded-[3px] bg-[var(--secondary)] opacity-30 sm:h-[6px]"
                />
              </span>
              {landing.headline.post}
            </h1>

            <p className="mt-2 max-w-[440px] font-body text-[13px] leading-snug text-white/85 sm:mt-3 sm:text-[15px]">
              {landing.subhead}
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center self-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
          >
            <MatchDeck prizes={landing.prizes} />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex w-full max-w-[440px] flex-col items-stretch gap-2 self-center lg:col-start-1 lg:row-start-2 lg:max-w-[440px] lg:items-start lg:gap-3 lg:self-start"
          >
            <Link
              href={landing.cta.href}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--secondary)] px-6 py-3 font-body text-[15px] font-semibold transition-all hover:scale-[1.01] hover:bg-[var(--secondary-hover)] sm:py-3.5 sm:text-[16px] lg:px-8"
              style={{ boxShadow: "0 12px 32px rgba(237,92,45,0.4)" }}
            >
              {landing.cta.label}
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <div className="flex w-full items-center gap-3">
              <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  className="h-full rounded-full bg-[var(--accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${proofPct}%` }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                />
              </div>
              <p className="shrink-0 font-body text-[11px] text-white/75 sm:text-[12px]">
                <span className="font-semibold text-white">
                  {landing.socialProof.current}
                </span>
                <span className="text-white/55">
                  /{landing.socialProof.total}
                </span>{" "}
                {landing.socialProof.suffix}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <footer className="mx-auto w-full max-w-[1180px] px-5 pb-3 text-center font-body text-[10px] text-white/45 sm:px-8 sm:pb-4 sm:text-[11px]">
        {landing.footer}
      </footer>
    </main>
  );
}
