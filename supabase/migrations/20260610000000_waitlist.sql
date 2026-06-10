-- Auto-update trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position        int  NOT NULL CHECK (position >= 4),
  referral_code   text NOT NULL UNIQUE DEFAULT lower(substr(md5(gen_random_uuid()::text), 1, 8)),
  referred_by     uuid REFERENCES waitlist_entries(id) ON DELETE SET NULL,
  answered_date   date,
  share_bumps_used int NOT NULL DEFAULT 0 CHECK (share_bumps_used <= 3),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ON waitlist_entries(user_id);
CREATE INDEX ON waitlist_entries(referral_code);

CREATE TRIGGER set_waitlist_entries_updated_at
  BEFORE UPDATE ON waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own row
CREATE POLICY "users_own_entry" ON waitlist_entries
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role bypasses RLS (Supabase default — no explicit policy needed)
