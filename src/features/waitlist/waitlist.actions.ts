'use server'

import { createClient } from '@supabase/supabase-js'
import { createClientServer } from '@/shared/supabase/server'

// Shared helper — NOT a server action. Called by createEntryAction and the OAuth callback route.
export async function createEntry(userId: string, referralCode?: string): Promise<void> {
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Idempotent: if entry already exists, return early.
  const { data: existing } = await serviceClient
    .from('waitlist_entries')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) return

  // Random position in range 80–250.
  const position = Math.floor(Math.random() * 171) + 80

  const { data: newEntry, error: insertError } = await serviceClient
    .from('waitlist_entries')
    .insert({ user_id: userId, position })
    .select()
    .single()

  if (insertError || !newEntry) return

  // Apply referral bump if a valid referral code was provided.
  if (referralCode) {
    const { data: referrer } = await serviceClient
      .from('waitlist_entries')
      .select('id, position')
      .eq('referral_code', referralCode)
      .maybeSingle()

    if (referrer) {
      // Link the new entry to its referrer.
      await serviceClient
        .from('waitlist_entries')
        .update({ referred_by: referrer.id })
        .eq('id', newEntry.id)

      // Bump referrer's position up by 5 (floor = 4).
      const newReferrerPosition = Math.max(referrer.position - 5, 4)
      await serviceClient
        .from('waitlist_entries')
        .update({ position: newReferrerPosition })
        .eq('id', referrer.id)
    }
  }
}

// Server action: called from signup page after email/password signup.
export async function createEntryAction(referralCode?: string): Promise<void> {
  const supabase = await createClientServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await createEntry(user.id, referralCode)
}

// Server action: called when the user submits their daily question answer.
// Bumps position by 1 (floor = 4). No-op if already answered today — invariant 5.
export async function answerQuestionAction(): Promise<void> {
  const supabase = await createClientServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: entry } = await serviceClient
    .from('waitlist_entries')
    .select('id, position, answered_date')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!entry) return

  const today = new Date().toISOString().slice(0, 10)
  // Already answered today — invariant 5.
  if (entry.answered_date === today) return

  const newPosition = Math.max(entry.position - 1, 4) // invariant 4
  await serviceClient
    .from('waitlist_entries')
    .update({ position: newPosition, answered_date: today })
    .eq('id', entry.id)
}

// Server action: called when the user shares their invite link.
// Bumps position by 5 (floor = 4). Capped at 3 uses — invariant 5.
export async function shareAction(): Promise<void> {
  const supabase = await createClientServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: entry } = await serviceClient
    .from('waitlist_entries')
    .select('id, position, share_bumps_used')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!entry) return

  // Cap at 3 share bumps — invariant 5.
  if (entry.share_bumps_used >= 3) return

  const newPosition = Math.max(entry.position - 5, 4) // invariant 4
  await serviceClient
    .from('waitlist_entries')
    .update({
      position: newPosition,
      share_bumps_used: entry.share_bumps_used + 1,
    })
    .eq('id', entry.id)
}

// No-op stub — referral claiming is handled inside createEntry.
// Exported so any file that references this name does not break.
export async function claimReferralAction(_referralCode: string): Promise<void> {
  // Intentional no-op: referral tracking is applied at entry creation time in createEntry().
}
