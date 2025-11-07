import { jwtDecode } from "jwt-decode";

export interface LoginRequest {
  email: string;
  password: string;
}

export async function loginApi({ email, password }: LoginRequest) {
  const res = await fetch("/api/AuthAPI/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: email,
      password: password
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  const token = data.token;

  const decoded: any = jwtDecode(token);
  const emailFromToken = decoded.email;
  const roleFromToken =
  decoded?.role ??
  decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
  null;


  localStorage.setItem("token", token);

  return {
    token,
    email: emailFromToken,
    role: roleFromToken,
  };
}

export function logoutApi() {
  localStorage.removeItem("token");
}
