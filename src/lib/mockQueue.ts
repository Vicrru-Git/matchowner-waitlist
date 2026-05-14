const STORAGE_KEY = "matchowner_waitlist_position";
const TOTAL_SEATS = 500;
const FLOOR = 4;
const MIN_START = 80;
const MAX_START = 250;
const ANSWER_BUMP = 1;
const SHARE_BUMP = 5;

type StoredPosition = {
  userId: string;
  position: number;
};

function hashUserId(userId: string): number {
  let h = 5381;
  for (let i = 0; i < userId.length; i++) {
    h = ((h << 5) + h + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function initialPosition(userId: string): number {
  const range = MAX_START - MIN_START + 1;
  return MIN_START + (hashUserId(userId) % range);
}

function read(): StoredPosition | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredPosition;
    if (typeof parsed.position === "number" && typeof parsed.userId === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribePosition(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function write(value: StoredPosition) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  notify();
}

export function getPosition(userId: string): number {
  const stored = read();
  if (stored && stored.userId === userId) return stored.position;
  const fresh = initialPosition(userId);
  write({ userId, position: fresh });
  return fresh;
}

export function readPositionSnapshot(userId: string): number {
  const stored = read();
  if (stored && stored.userId === userId) return stored.position;
  return initialPosition(userId);
}

function bumpBy(userId: string, delta: number): number {
  const current = getPosition(userId);
  const next = Math.max(FLOOR, current - delta);
  write({ userId, position: next });
  return next;
}

export function bumpForAnswer(userId: string): number {
  return bumpBy(userId, ANSWER_BUMP);
}

export function bumpForShare(userId: string): number {
  return bumpBy(userId, SHARE_BUMP);
}

export const queueConfig = {
  totalSeats: TOTAL_SEATS,
  floor: FLOOR,
};
