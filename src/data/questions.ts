export type DailyQuestion = {
  id: string;
  prompt: string;
  options: readonly { value: string; label: string }[];
};

export const questions: readonly DailyQuestion[] = [
  {
    id: "intent",
    prompt: "¿Quieres comprar o alquilar?",
    options: [
      { value: "buy", label: "Comprar" },
      { value: "rent", label: "Alquilar" },
      { value: "both", label: "Aún lo estoy decidiendo" },
    ],
  },
  {
    id: "tenure",
    prompt: "¿Cuánto tiempo llevas buscando?",
    options: [
      { value: "<1m", label: "Menos de 1 mes" },
      { value: "1-3m", label: "Entre 1 y 3 meses" },
      { value: "3-6m", label: "Entre 3 y 6 meses" },
      { value: ">6m", label: "Más de 6 meses" },
    ],
  },
  {
    id: "role",
    prompt: "¿Eres propietario o interesado?",
    options: [
      { value: "owner", label: "Propietario" },
      { value: "buyer", label: "Interesado / comprador" },
      { value: "tenant", label: "Interesado / inquilino" },
    ],
  },
  {
    id: "city",
    prompt: "¿En qué ciudad estás buscando?",
    options: [
      { value: "madrid", label: "Madrid" },
      { value: "bcn", label: "Barcelona" },
      { value: "vlc", label: "Valencia" },
      { value: "other", label: "Otra ciudad" },
    ],
  },
  {
    id: "now",
    prompt: "¿Dónde vives ahora mismo?",
    options: [
      { value: "rent", label: "De alquiler" },
      { value: "own", label: "Vivienda propia" },
      { value: "family", label: "Con familia" },
      { value: "share", label: "Compartiendo piso" },
    ],
  },
];

export function questionForToday(date = new Date()): DailyQuestion {
  const dayOfYear = Math.floor(
    (date.getTime() -
      new Date(date.getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return questions[dayOfYear % questions.length];
}
