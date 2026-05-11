export type MockUser = {
  userId: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  provider: "form" | "google";
};

const STORAGE_KEY = "matchowner_waitlist_user";

export function saveMockUser(input: {
  name: string;
  email: string;
  phone?: string;
  provider?: "form" | "google";
}): MockUser {
  const user: MockUser = {
    userId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || undefined,
    provider: input.provider ?? "form",
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function getMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}
