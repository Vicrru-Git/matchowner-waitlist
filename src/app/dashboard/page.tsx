"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getMockUser } from "@/lib/mockUser";
import {
  bumpForAnswer,
  bumpForShare,
  readPositionSnapshot,
  subscribePosition,
} from "@/lib/mockQueue";
import { questionForToday } from "@/data/questions";
import { dashboard } from "@/data/dashboard";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { QuestionCard } from "@/components/dashboard/QuestionCard";
import { InviteBlock } from "@/components/dashboard/InviteBlock";

const subscribeUser = () => () => {};

export default function DashboardPage() {
  const router = useRouter();

  const user = useSyncExternalStore(
    subscribeUser,
    () => getMockUser(),
    () => null,
  );

  const position = useSyncExternalStore(
    subscribePosition,
    () => (user ? readPositionSnapshot(user.userId) : 0),
    () => 0,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getMockUser() === null) {
      router.replace("/signup");
    }
  }, [router]);

  if (!user) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-[var(--bg-gray)] text-[var(--text-muted)]">
        <p className="font-body text-[14px]">Cargando…</p>
      </main>
    );
  }

  const firstName = user.name.split(" ")[0] || user.name;
  const inviteLink = `https://matchowner.example/r/${user.userId}`;
  const question = questionForToday();

  return (
    <main
      className="min-h-[100svh] bg-[var(--bg-gray)]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(184,228,239,0.35) 0%, rgba(246,246,246,0) 55%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1080px] flex-col px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-body text-[12px] font-medium text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--bg-gray-dark)] transition-colors hover:bg-[var(--bg-gray)]"
          >
            <ArrowLeft size={14} />
            Inicio
          </Link>
          <span className="font-heading text-[15px] font-extrabold tracking-tight text-[var(--text-primary)] sm:text-[17px]">
            {dashboard.wordmark}
          </span>
        </header>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-6 flex flex-col gap-3 sm:gap-4"
        >
          <motion.div variants={fadeInUp} className="flex flex-col gap-1">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--accent)]/50 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary-dark)] sm:text-[11px]">
              <Sparkles size={11} />
              {dashboard.eyebrow}
            </span>
            <h1 className="mt-1 font-heading text-[24px] font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[30px]">
              {dashboard.greeting(firstName)}
            </h1>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <PositionCard position={position} />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="grid gap-3 sm:gap-4 lg:grid-cols-2"
          >
            <QuestionCard
              question={question}
              onAnswer={() => bumpForAnswer(user.userId)}
            />
            <InviteBlock
              link={inviteLink}
              onShare={() => bumpForShare(user.userId)}
            />
          </motion.div>
        </motion.section>

        <footer className="mt-8 text-center font-body text-[11px] text-[var(--text-muted)]">
          {dashboard.footer}
        </footer>
      </div>
    </main>
  );
}
