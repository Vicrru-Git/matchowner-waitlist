"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageSquareText } from "lucide-react";
import { dashboard } from "@/data/dashboard";
import type { DailyQuestion } from "@/data/questions";

export function QuestionCard({
  question,
  onAnswer,
}: {
  question: DailyQuestion;
  onAnswer: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || answered) return;
    setAnswered(true);
    onAnswer();
  }

  return (
    <section
      className="rounded-3xl border border-[var(--bg-gray-dark)] bg-white p-6 shadow-[0_20px_48px_-24px_rgba(15,30,60,0.25)] sm:p-7"
      aria-labelledby="question-heading"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary-dark)]">
          <MessageSquareText size={16} strokeWidth={2.4} />
        </span>
        <p
          id="question-heading"
          className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]"
        >
          {dashboard.question.eyebrow}
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!answered ? (
          <motion.form
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="mt-3"
          >
            <h2 className="font-heading text-[20px] font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[22px]">
              {question.prompt}
            </h2>

            <div className="mt-4 flex flex-col gap-2">
              {question.options.map((opt) => {
                const isOn = selected === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 font-body text-[14px] transition-colors ${
                      isOn
                        ? "border-[var(--primary)] bg-[var(--primary)]/[0.06] text-[var(--text-primary)]"
                        : "border-[var(--bg-gray-dark)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-gray)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        isOn
                          ? "border-[var(--primary)] bg-[var(--primary)]"
                          : "border-[var(--bg-gray-dark)] bg-white"
                      }`}
                    >
                      {isOn && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <input
                      type="radio"
                      name={question.id}
                      value={opt.value}
                      checked={isOn}
                      onChange={() => setSelected(opt.value)}
                      className="sr-only"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="font-body text-[11px] text-[var(--text-muted)] sm:text-[12px]">
                {dashboard.question.note}
              </p>
              <button
                type="submit"
                disabled={!selected}
                className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] px-4 py-2.5 font-body text-[13px] font-semibold text-white transition-all hover:scale-[1.02] hover:bg-[var(--secondary-hover)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:text-[14px]"
                style={{ boxShadow: "0 10px 24px rgba(237,92,45,0.25)" }}
              >
                {dashboard.question.submit}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="answered"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex items-start gap-3 rounded-2xl bg-[var(--accent)]/40 p-4"
          >
            <CheckCircle2
              size={22}
              className="mt-0.5 shrink-0 text-[var(--primary-dark)]"
            />
            <div>
              <p className="font-heading text-[15px] font-extrabold text-[var(--text-primary)] sm:text-[16px]">
                {dashboard.question.answered.title}
              </p>
              <p className="mt-1 font-body text-[13px] text-[var(--text-secondary)]">
                {dashboard.question.answered.body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
