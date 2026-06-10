"use client";

import { useState } from "react";
import { Copy, Mail, Send, Share2 } from "lucide-react";
import { dashboard } from "@/data/dashboard";
import { shareAction } from "@/features/waitlist/waitlist.actions";

type ShareKind = "copy" | "whatsapp" | "email";

export function InviteBlock({
  referralCode,
  shareBumpsUsed,
  appUrl,
}: {
  referralCode: string;
  shareBumpsUsed: number;
  appUrl: string;
}) {
  const link = `${appUrl}/r/${referralCode}`;
  const [localBumpsUsed, setLocalBumpsUsed] = useState(shareBumpsUsed);
  const [used, setUsed] = useState<Record<ShareKind, boolean>>({
    copy: false,
    whatsapp: false,
    email: false,
  });
  const [copied, setCopied] = useState(false);

  const bumpsLeft = 3 - localBumpsUsed;
  const allUsed = localBumpsUsed >= 3;

  async function markUsed(kind: ShareKind) {
    setUsed((prev) => {
      if (prev[kind]) return prev;
      return { ...prev, [kind]: true };
    });
    if (localBumpsUsed < 3) {
      setLocalBumpsUsed((n) => Math.min(n + 1, 3));
      await shareAction();
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // best-effort fallback: select-and-prompt
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
    await markUsed("copy");
  }

  async function handleWhatsapp() {
    const text = `${dashboard.invite.share.message("")}${link}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    await markUsed("whatsapp");
  }

  async function handleEmail() {
    const subject = encodeURIComponent(dashboard.invite.share.emailSubject);
    const body = encodeURIComponent(
      `${dashboard.invite.share.message("")}${link}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    await markUsed("email");
  }

  return (
    <section
      className="rounded-3xl border border-[var(--bg-gray-dark)] bg-white p-6 shadow-[0_20px_48px_-24px_rgba(15,30,60,0.25)] sm:p-7"
      aria-labelledby="invite-heading"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--secondary)]/15 text-[var(--secondary)]">
          <Share2 size={16} strokeWidth={2.4} />
        </span>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {dashboard.invite.eyebrow}
        </p>
      </div>

      <h2
        id="invite-heading"
        className="mt-3 font-heading text-[20px] font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[22px]"
      >
        {dashboard.invite.title}
      </h2>
      <p className="mt-1.5 font-body text-[13px] text-[var(--text-muted)]">
        {dashboard.invite.body}
      </p>

      <div className="mt-4">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {dashboard.invite.linkLabel}
        </p>
        <div className="mt-1.5 flex items-stretch gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-[var(--bg-gray-dark)] bg-[var(--bg-gray)] px-3 py-2.5">
            <span className="truncate font-body text-[13px] text-[var(--text-secondary)]">
              {link}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--bg-gray-dark)] bg-white px-3 py-2.5 font-body text-[13px] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-gray)]"
            aria-label={dashboard.invite.actions.copy}
          >
            <Copy size={14} />
            <span className="hidden sm:inline">
              {copied
                ? dashboard.invite.actions.copied
                : dashboard.invite.actions.copy}
            </span>
          </button>
        </div>
      </div>

      {bumpsLeft > 0 && (
        <p className="mt-3 font-body text-[12px] text-[var(--text-muted)]">
          {bumpsLeft === 1
            ? "Te queda 1 invitación con subida de puesto"
            : `Te quedan ${bumpsLeft} invitaciones con subida de puesto`}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleWhatsapp}
          disabled={allUsed}
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-body text-[14px] font-semibold text-white transition-all hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:brightness-100"
          style={{ boxShadow: allUsed ? "none" : "0 10px 24px rgba(37,211,102,0.25)" }}
        >
          <Send size={15} />
          {used.whatsapp
            ? dashboard.invite.actions.used
            : dashboard.invite.actions.whatsapp}
        </button>
        <button
          type="button"
          onClick={handleEmail}
          disabled={allUsed}
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--bg-gray-dark)] bg-white px-4 py-3 font-body text-[14px] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-gray)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        >
          <Mail size={15} />
          {used.email
            ? dashboard.invite.actions.used
            : dashboard.invite.actions.email}
        </button>
      </div>
    </section>
  );
}
