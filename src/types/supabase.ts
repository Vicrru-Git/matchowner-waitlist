export interface WaitlistEntry {
  id: string
  user_id: string
  position: number
  referral_code: string
  referred_by: string | null
  answered_date: string | null   // ISO date string YYYY-MM-DD
  share_bumps_used: number
  created_at: string
  updated_at: string
}
