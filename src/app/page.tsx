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
          "radial-gradient(ellipse at 50% 22%, rgba(184,228,239,0.22) 0%, rgba(53,99,174,0) 60%), radial-gradient(circle at 90% 0%, rgba(237,92,45,0.18) 0%, transparent 42%)",
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
        className="mx-auto flex w-full min-h-0 max-w-[1180px] flex-col justify-between px-5 pb-2 pt-2 sm:px-8 sm:pb-3 sm:pt-3 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_auto] lg:items-center lg:justify-stretch lg:gap-x-12 lg:gap-y-5 lg:py-6"
      >
        <motion.div
          variants={fadeInUp}
          className="mx-auto flex w-full max-w-[clamp(340px,82vw,400px)] flex-col items-center text-center lg:col-start-1 lg:row-start-1 lg:mx-0 lg:max-w-none lg:items-start lg:self-end lg:text-left"
        >
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] sm:text-[11px]">
            {landing.eyebrow}
          </p>
          <h1 className="mt-2.5 font-heading text-[clamp(19px,5.2vw,28px)] font-extrabold leading-[1.1] tracking-tight lg:text-[44px]">
            {landing.headline.pre && <>{landing.headline.pre} </>}
            <span className="relative inline-block">
              <span className="text-[var(--secondary)]">
                {landing.headline.highlight}
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-[clamp(3px,0.9vw,5px)] rounded-[3px] bg-[var(--secondary)] opacity-30"
              />
            </span>
            {landing.headline.post}
          </h1>
          <p className="mt-2.5 max-w-[clamp(340px,82vw,400px)] font-body text-[clamp(12.5px,3.3vw,15px)] leading-[1.4] text-white/80 lg:max-w-[460px] lg:text-[15px]">
            {landing.subhead}
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="relative flex items-center justify-center self-center lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[280px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/30 blur-[60px] min-[400px]:h-[310px] min-[400px]:w-[345px] min-[430px]:h-[335px] min-[430px]:w-[365px] sm:h-[355px] sm:w-[380px] lg:h-[360px] lg:w-[380px]"
          />
          <div className="relative z-10">
            <MatchDeck prizes={landing.prizes} />
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mx-auto flex w-full max-w-[clamp(280px,80vw,360px)] flex-col items-center gap-2.5 self-center lg:col-start-1 lg:row-start-2 lg:mx-0 lg:max-w-[420px] lg:items-start lg:gap-3"
        >
          <Link
            href={landing.cta.href}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--secondary)] px-6 py-3 font-body text-[clamp(14.5px,3.8vw,17px)] font-semibold transition-all hover:scale-[1.02] hover:bg-[var(--secondary-hover)] sm:py-3.5 lg:px-8 lg:text-[16px]"
            style={{ boxShadow: "0 14px 36px rgba(237,92,45,0.42)" }}
          >
            {landing.cta.label}
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <div className="flex w-full items-center gap-2.5">
            <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${proofPct}%` }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
              />
            </div>
            <p className="shrink-0 font-body text-[10.5px] text-white/70 sm:text-[11px]">
              <span className="font-semibold text-white">
                {landing.socialProof.current}
              </span>
              <span className="text-white/50">
                /{landing.socialProof.total}
              </span>{" "}
              {landing.socialProof.suffix}
            </p>
          </div>
        </motion.div>
      </motion.section>

      <footer className="mx-auto w-full max-w-[1180px] px-5 pb-2.5 text-center font-body text-[10px] text-white/45 sm:px-8 sm:pb-4 sm:text-[11px]">
        {landing.footer}
      </footer>
    </main>
  );
}
