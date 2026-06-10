import { redirect } from 'next/navigation'

// Server-only referral redirect. No HTML rendered.
// Receives the referral code from the URL and redirects to /signup with ?ref=<code>.
export default async function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  redirect(`/signup?ref=${code}`)
}
