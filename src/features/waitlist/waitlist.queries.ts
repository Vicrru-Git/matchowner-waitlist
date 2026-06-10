import { createClientServer } from '@/shared/supabase/server'
import type { WaitlistEntry } from '@/types/supabase'

// Returns the waitlist entry for a user using the user-scoped client (RLS enforced).
export async function getEntry(userId: string): Promise<WaitlistEntry | null> {
  const supabase = await createClientServer()
  const { data } = await supabase
    .from('waitlist_entries')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  return data ?? null
}

// Returns the user's current queue position, falling back to 250 if no entry exists.
export async function getPosition(userId: string): Promise<number> {
  const entry = await getEntry(userId)
  return entry?.position ?? 250
}
