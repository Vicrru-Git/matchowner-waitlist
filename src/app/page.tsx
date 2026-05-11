"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { landing } from "@/data/landing";
import { WalkingHand } from "@/components/landing/WalkingHand";

export default function Page() {
  const proofPct = Math.round(
    (landing.socialProof.current / landing.socialProof.total) * 100,
  );

  return (
    <main
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[var(--primary)] text-white"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 35%, rgba(184,228,239,0.20) 0%, rgba(53,99,174,0) 60%), radial-gradient(circle at 90% 0%, rgba(237,92,45,0.16) 0%, transparent 40%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <span className="font-heading text-[15px] font-extrabold tracking-tight text-white sm:text-[17px]">
          {landing.wordmark}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm sm:text-[12px]">
          <Sparkles size={12} className="text-[var(--accent)]" />
          {landing.topBadge}
        </span>
      </div>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-[680px] flex-1 flex-col items-center justify-center px-5 py-8 text-center sm:px-8 sm:py-10"
      >
        <motion.p
          variants={fadeInUp}
          className="font-body text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)] sm:text-[12px]"
        >
          {landing.eyebrow}
        </motion.p>

        <motion.h1
          variants={fadeInUp}
          className="mt-4 font-heading text-[30px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[42px] lg:text-[52px]"
        >
          {landing.headline.pre}{" "}
          <span className="relative inline-block">
            <span className="text-[var(--secondary)]">
              {landing.headline.highlight}
            </span>
            <span
              aria-hidden
              className="absolute left-0 right-0 -bottom-1 h-[5px] rounded-[3px] bg-[var(--secondary)] opacity-30 sm:h-[6px]"
            />
          </span>
          {landing.headline.post}
        </motion.h1>

        <motion.div variants={fadeInUp} className="mt-6 sm:mt-8">
          <WalkingHand />
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="mt-6 max-w-[480px] font-body text-[15px] leading-relaxed text-white/85 sm:mt-7 sm:text-[17px]"
        >
          {landing.subhead}
        </motion.p>

        <motion.ul
          variants={fadeInUp}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-7 sm:gap-2.5"
        >
          {landing.bullets.map((b) => (
            <li
              key={b}
              className="rounded-full bg-white/10 px-3 py-1.5 font-body text-[12px] font-medium text-white ring-1 ring-inset ring-white/15 backdrop-blur-sm sm:px-4 sm:py-2 sm:text-[13px]"
            >
              {b}
            </li>
          ))}
        </motion.ul>

        <motion.div variants={fadeInUp} className="mt-7 w-full sm:mt-9 sm:w-auto">
          <Link
            href={landing.cta.href}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--secondary)] px-7 py-4 font-body text-[16px] font-semibold text-white transition-all hover:bg-[var(--secondary-hover)] hover:scale-[1.02] sm:w-auto sm:px-9 sm:text-[17px]"
            style={{ boxShadow: "0 10px 28px rgba(237, 92, 45, 0.35)" }}
          >
            {landing.cta.label}
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-7 flex w-full max-w-[360px] flex-col items-center gap-2 sm:mt-9"
        >
          <p className="font-body text-[12px] text-white/70 sm:text-[13px]">
            <span className="font-semibold text-white">
              {landing.socialProof.current}
            </span>{" "}
            de {landing.socialProof.total} {landing.socialProof.suffix}
          </p>
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full bg-[var(--accent)]"
              initial={{ width: 0 }}
              animate={{ width: `${proofPct}%` }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
            />
          </div>
        </motion.div>
      </motion.section>

      <footer className="mx-auto w-full max-w-[1100px] px-5 pb-5 text-center font-body text-[11px] text-white/45 sm:px-8 sm:pb-7 sm:text-[12px]">
        {landing.footer}
      </footer>
    </main>
  );
}
