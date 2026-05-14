export const dashboard = {
  wordmark: "Match Owner",
  greeting: (name: string) => `Hola, ${name}`,
  eyebrow: "Waitlist privada",
  position: {
    label: "Tu puesto en la cola",
    of: (n: number) => `de ${n}`,
    prizeNote: "Los 10 primeros se llevan premio",
    progressLabel: (n: number) =>
      `${n} personas por delante. Sigue subiendo.`,
    floorNote: "Demo · el puesto no baja del 4",
  },
  question: {
    eyebrow: "Pregunta de hoy",
    note: "Respóndela y sube 1 puesto",
    answered: {
      title: "¡Listo!",
      body: "Has subido 1 puesto. Vuelve mañana para la siguiente pregunta.",
    },
    submit: "Responder y subir",
  },
  invite: {
    eyebrow: "Sube más rápido",
    title: "Invita a tus amig@s",
    body: "Cada vez que alguien entre por tu enlace, subes 5 puestos.",
    linkLabel: "Tu enlace",
    actions: {
      copy: "Copiar enlace",
      copied: "Copiado ✓",
      whatsapp: "Compartir en WhatsApp",
      email: "Compartir por email",
      used: "Listo ✓",
    },
    share: {
      message: (name: string) =>
        `Mira esto, me he metido en la waitlist de Match Owner. ${name === "" ? "" : `Te dejo mi enlace`} → `,
      emailSubject: "Te invito a la waitlist de Match Owner",
    },
  },
  footer: "© 2026 Match Owner · demo",
};
