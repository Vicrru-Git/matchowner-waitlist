import { Resend } from 'resend'

export async function sendWelcomeEmail(
  to: string,
  name: string,
  position: number,
  referralLink: string
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const firstName = name.split(' ')[0]
  await resend.emails.send({
    from: 'MatchOwner <hola@matchowner.es>',
    to,
    subject: `¡Estás dentro, ${firstName}! 🏠`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#3563AE;font-size:24px;margin-bottom:8px">Bienvenido a MatchOwner</h1>
        <p style="color:#1a1a1a;font-size:16px">Hola ${firstName},</p>
        <p style="color:#1a1a1a;font-size:16px">
          Estás en el puesto <strong style="color:#ED5C2D">#${position}</strong> de 500 plazas beta.
          Los 3 primeros acceden al premio.
        </p>
        <p style="color:#1a1a1a;font-size:16px">
          Sube posiciones invitando a amigos con tu enlace:
        </p>
        <a href="${referralLink}" style="display:inline-block;background:#3563AE;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;margin:8px 0">
          Mi enlace de invitación →
        </a>
        <p style="color:#666;font-size:13px;margin-top:24px">
          Cada amigo que se una te sube 5 puestos. Cada pregunta respondida, 1 puesto.
        </p>
        <p style="color:#999;font-size:12px;margin-top:32px">MatchOwner · Madrid, España</p>
      </div>
    `,
  })
}
