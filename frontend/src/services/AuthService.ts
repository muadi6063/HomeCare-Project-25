import { jwtDecode } from "jwt-decode";

export interface LoginRequest {
  email: string;
  password: string;
}

// Extracts user ID from various possible claim names used by .NET Identity
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
    body: JSON.stringify({ username: email, password }), // backend expects "username"
  });

  // Detailed and safe login error parsing (handles raw text, JSON, and ASP.NET model errors)
  if (!res.ok) {
    const text = await res.text();
    let msg = "Login failed.";

    if (text) {
      try {
        const errJson = JSON.parse(text);

        if (typeof errJson === "string") {
          msg = errJson;
        } else if (typeof errJson.message === "string") {
          msg = errJson.message; // e.g. { message: "Invalid username or password" }
        } else {
          msg = text;
        }
      } catch {
        msg = text || `Login failed ${res.status}`; // raw non-JSON response
      }
    } else {
      msg = `Login failed ${res.status}`;
    }

    throw new Error(msg);
  }

  const data = await res.json();
  const token: string = data.token;

  // Decode JWT token to extract claims (.NET Identity uses mixed claim naming)
  const d: any = jwtDecode(token);

  const emailFromToken = d?.email ?? null;

  const roleFromToken =
    d?.role ??
    d?.roles ??
    (Array.isArray(data.roles) ? data.roles[0] : data.roles) ??
    null;

  const userIdFromToken = pickUserId(d);

  // Persist JWT for authenticated API requests
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

export interface RegisterRequest {
  username: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function registerApi(data: RegisterRequest) {
  const res = await fetch("/api/AuthAPI/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  // Robust registration error extraction
  if (!res.ok) {
    let msg = "Registration failed.";

    if (text) {
      try {
        const errJson = JSON.parse(text);

        if (typeof errJson === "string") {
          msg = errJson;
        } else if (typeof errJson.message === "string") {
          msg = errJson.message;
        } else if (errJson.errors) {
          // ASP.NET-style model validation errors (object of string arrays)
          const allErrors = Object.values(errJson.errors)
            .flat()
            .filter((x) => typeof x === "string") as string[];

          if (allErrors.length > 0) {
            msg = allErrors[0];
          }
        }
      } catch {
        msg = text; // not valid JSON -> fallback to raw server response
      }
    } else {
      msg = `Registration failed ${res.status}`;
    }

    throw new Error(msg);
  }

  // Registration success may return plain text or JSON -> handle both
  try {
    const json = JSON.parse(text);
    return json;
  } catch {
    return null;
  }
}