const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setAdminToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("admin_token", token);
}

export function clearAdminToken() {
  if (typeof window !== "undefined") localStorage.removeItem("admin_token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { body?: unknown; admin?: boolean } = {}
): Promise<T> {
  const { body, admin, ...rest } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };

  if (admin) {
    const token = getAdminToken();
    if (token) headers["x-admin-token"] = token;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.details || res.statusText);
  }
  return res.json().catch(() => ({} as T));
}

