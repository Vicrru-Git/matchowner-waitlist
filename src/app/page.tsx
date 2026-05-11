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
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 pt-4 sm:px-8 sm:pt-5">
        <span className="font-heading text-[15px] font-extrabold tracking-tight sm:text-[17px]">
          {landing.wordmark}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset ring-white/20 backdrop-blur-sm sm:text-[11px]">
          <Sparkles size={11} className="text-[var(--accent)]" />
          {landing.topBadge}
        </span>
      </header>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full min-h-0 max-w-[1180px] items-center px-5 sm:px-8"
      >
        <div className="grid w-full items-center gap-5 sm:gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.p
              variants={fadeInUp}
              className="font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] sm:text-[11px]"
            >
              {landing.eyebrow}
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="mt-3 font-heading text-[22px] font-extrabold leading-[1.08] tracking-tight sm:text-[32px] lg:text-[44px]"
            >
              {landing.headline.pre}{" "}
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
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-3 max-w-[440px] font-body text-[13px] leading-snug text-white/85 sm:mt-4 sm:text-[15px]"
            >
              {landing.subhead}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-5 flex w-full max-w-[340px] flex-col items-stretch gap-3 sm:mt-6 sm:max-w-[380px] lg:max-w-none lg:items-start"
            >
              <Link
                href={landing.cta.href}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--secondary)] px-6 py-3.5 font-body text-[15px] font-semibold transition-all hover:scale-[1.02] hover:bg-[var(--secondary-hover)] sm:text-[16px] lg:px-8"
                style={{ boxShadow: "0 10px 28px rgba(237,92,45,0.35)" }}
              >
                {landing.cta.label}
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <div className="flex w-full flex-col gap-1.5 lg:max-w-[360px]">
                <p className="font-body text-[11px] text-white/75 sm:text-[12px]">
                  <span className="font-semibold text-white">
                    {landing.socialProof.current}
                  </span>{" "}
                  / {landing.socialProof.total} {landing.socialProof.suffix}
                </p>
                <div className="h-[5px] w-full overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-[var(--accent)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${proofPct}%` }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center"
          >
            <MatchDeck cards={landing.matchCards} />
          </motion.div>
        </div>
      </motion.section>

      <footer className="mx-auto w-full max-w-[1180px] px-5 pb-3 text-center font-body text-[10px] text-white/45 sm:px-8 sm:pb-4 sm:text-[11px]">
        {landing.footer}
      </footer>
    </main>
  );
}
