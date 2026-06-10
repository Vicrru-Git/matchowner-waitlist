import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { createClientServer } from "@/shared/supabase/server";
import { getEntry } from "@/features/waitlist/waitlist.queries";
import { createEntry } from "@/features/waitlist/waitlist.actions";
import { questionForToday } from "@/data/questions";
import { dashboard } from "@/data/dashboard";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { QuestionCard } from "@/components/dashboard/QuestionCard";
import { InviteBlock } from "@/components/dashboard/InviteBlock";

export default async function DashboardPage() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects unauthenticated users — this is a defensive guard.
  if (!user) {
    redirect("/signup");
  }

  let entry = await getEntry(user.id);

  // Entry may be absent if OAuth callback failed to call createEntry — recover here.
  if (!entry) {
    await createEntry(user.id);
    entry = await getEntry(user.id);
  }

  // If entry is still null after recovery attempt, use safe fallback values.
  const position = entry?.position ?? 250;
  const referralCode = entry?.referral_code ?? "";
  const shareBumpsUsed = entry?.share_bumps_used ?? 0;
  const answeredToday =
    entry?.answered_date === new Date().toISOString().slice(0, 10);

  const question = questionForToday();
  const firstName = (
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "Usuario"
  )
    .split(" ")[0];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://matchowner.es";

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
            <QuestionCard question={question} answeredToday={answeredToday} />
            <InviteBlock
              referralCode={referralCode}
              shareBumpsUsed={shareBumpsUsed}
              appUrl={appUrl}
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
