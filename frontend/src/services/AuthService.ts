import { jwtDecode } from "jwt-decode";

export interface LoginRequest {
  email: string;
  password: string;
}

function pickUserId(d: any) {
  return (
    d?.nameid ??
    d?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
    d?.uid ??
    null
  );
}

export async function loginApi({ email, password }: LoginRequest) {
  const res = await fetch("/api/AuthAPI/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  const token: string = data.token;

  // Dekode for å hente e-post, rolle og userId
  const d: any = jwtDecode(token);
  const emailFromToken = d?.email ?? null;
  const roleFromToken =
    d?.role ??
    d?.roles ??
    (Array.isArray(data.roles) ? data.roles[0] : data.roles) ??
    null;

  const userIdFromToken = pickUserId(d);

  localStorage.setItem("token", token);

  return {
    token,
    email: emailFromToken,
    role: Array.isArray(roleFromToken) ? roleFromToken[0] : roleFromToken,
    userId: userIdFromToken,
  };
}

export function logoutApi() {
  localStorage.removeItem("token");
}
