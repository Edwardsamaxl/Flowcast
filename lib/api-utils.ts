import { randomUUID } from "node:crypto";

export function uid(): string {
  return randomUUID();
}

export function now(): number {
  return Math.floor(Date.now() / 1000);
}

export function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(message: string, status = 400): Response {
  return json({ error: message }, status);
}

// Parse JSON fields from SQLite text columns
export function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
