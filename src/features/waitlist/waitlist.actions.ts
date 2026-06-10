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
