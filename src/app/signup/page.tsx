"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { createClientBrowser } from "@/shared/supabase/client";
import { createEntryAction } from "@/features/waitlist/waitlist.actions";
import { signup } from "@/data/signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "password", string>>;

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#EA4335"
        d="M9 3.6c1.32 0 2.51.45 3.45 1.34l2.58-2.58C13.46.95 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3 2.33C4.67 5.18 6.66 3.6 9 3.6Z"
      />
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61Z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42l-3-2.33A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.33Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.34 0-4.33-1.58-5.04-3.7l-3 2.33C2.44 15.98 5.48 18 9 18Z"
      />
    </svg>
  );
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = use(searchParams);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState<null | "form" | "google">(null);
  const [authError, setAuthError] = useState<string | null>(null);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = signup.errors.nameRequired;
    if (!email.trim()) next.email = signup.errors.emailRequired;
    else if (!EMAIL_RE.test(email.trim()))
      next.email = signup.errors.emailInvalid;
    if (password.length < 8)
      next.password = "La contraseña debe tener al menos 8 caracteres";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting("form");
    setAuthError(null);

    const supabase = createClientBrowser();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim(), phone },
      },
    });

    if (error) {
      setAuthError(error.message);
      setSubmitting(null);
      return;
    }

    await createEntryAction(ref);
    router.push("/dashboard");
  }

  async function handleGoogle() {
    setSubmitting("google");
    setAuthError(null);
    const supabase = createClientBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?ref=${ref ?? ""}`,
      },
    });
  }

  return (
    <main
      className="min-h-[100svh] bg-[var(--primary)] text-white"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 22%, rgba(184,228,239,0.22) 0%, rgba(53,99,174,0) 60%), radial-gradient(circle at 90% 0%, rgba(237,92,45,0.18) 0%, transparent 42%)",
      }}
    >
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1180px] flex-col px-5 py-5 sm:px-8 sm:py-6">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-body text-[12px] font-medium text-white/85 ring-1 ring-inset ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/15 hover:text-white"
          >
            <ArrowLeft size={14} />
            {signup.back}
          </Link>
          <span className="font-heading text-[15px] font-extrabold tracking-tight sm:text-[17px]">
            {signup.wordmark}
          </span>
        </header>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-1 items-center justify-center py-6"
        >
          <motion.div
            variants={fadeInUp}
            className="relative w-full max-w-[440px] rounded-3xl bg-white p-6 text-[var(--text-primary)] sm:p-8"
            style={{ boxShadow: "0 24px 70px rgba(15, 30, 65, 0.35)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-2 left-6 h-1.5 w-16 rounded-full bg-[var(--secondary)] sm:left-8"
            />

            <motion.p
              variants={fadeInUp}
              className="font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--secondary)] sm:text-[11px]"
            >
              {signup.eyebrow}
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="mt-2 font-heading text-[24px] font-extrabold leading-[1.1] tracking-tight sm:text-[28px]"
            >
              {signup.title}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-2 font-body text-[13px] text-[var(--text-muted)] sm:text-[14px]"
            >
              {signup.subhead}
            </motion.p>

            <motion.button
              variants={fadeInUp}
              type="button"
              onClick={handleGoogle}
              disabled={submitting !== null}
              className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--bg-gray-dark)] bg-white px-4 py-3 font-body text-[14px] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-gray)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting === "google" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <GoogleGlyph />
              )}
              {signup.google}
            </motion.button>

            <motion.div
              variants={fadeInUp}
              className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]"
            >
              <span className="h-px flex-1 bg-[var(--bg-gray-dark)]" />
              {signup.divider}
              <span className="h-px flex-1 bg-[var(--bg-gray-dark)]" />
            </motion.div>

            <motion.form
              variants={fadeInUp}
              noValidate
              onSubmit={handleSubmit}
              className="flex flex-col gap-3.5"
            >
              <Field
                id="name"
                label={signup.fields.name.label}
                placeholder={signup.fields.name.placeholder}
                value={name}
                onChange={setName}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                id="email"
                type="email"
                label={signup.fields.email.label}
                placeholder={signup.fields.email.placeholder}
                value={email}
                onChange={setEmail}
                error={errors.email}
                autoComplete="email"
              />
              <Field
                id="password"
                type="password"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={setPassword}
                error={errors.password}
                autoComplete="new-password"
              />
              <Field
                id="phone"
                type="tel"
                label={signup.fields.phone.label}
                optionalTag={signup.fields.phone.optionalTag}
                placeholder={signup.fields.phone.placeholder}
                value={phone}
                onChange={setPhone}
                autoComplete="tel"
              />

              {authError && (
                <p
                  role="alert"
                  className="rounded-lg bg-[var(--secondary)]/10 px-3 py-2 font-body text-[12px] text-[var(--secondary)]"
                >
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting !== null}
                className="group mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--secondary)] px-6 py-3.5 font-body text-[15px] font-semibold text-white transition-all hover:scale-[1.01] hover:bg-[var(--secondary-hover)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                style={{ boxShadow: "0 10px 28px rgba(237,92,45,0.35)" }}
              >
                {submitting === "form" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {signup.submit}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </motion.form>

            <motion.p
              variants={fadeInUp}
              className="mt-4 text-center font-body text-[11px] text-[var(--text-muted)] sm:text-[12px]"
            >
              {signup.note}
            </motion.p>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  optionalTag,
  autoComplete,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  optionalTag?: string;
  autoComplete?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center justify-between font-body text-[12px] font-semibold text-[var(--text-secondary)]"
      >
        <span>{label}</span>
        {optionalTag && (
          <span className="font-normal text-[11px] text-[var(--text-muted)]">
            {optionalTag}
          </span>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1 w-full rounded-xl border bg-white px-3.5 py-2.5 font-body text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 ${
          error
            ? "border-[var(--secondary)]"
            : "border-[var(--bg-gray-dark)]"
        }`}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 font-body text-[12px] text-[var(--secondary)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
