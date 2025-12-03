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
    let msg = "Login failed.";

    if (text) {
      try {
        const errJson = JSON.parse(text);

        if (typeof errJson === "string") {
          msg = errJson;
        } else if (typeof errJson.message === "string") {
          // f.eks. { "message": "Invalid username or password" }
          msg = errJson.message;
        } else {
          msg = text;
        }
      } catch {
        // ikke gyldig JSON → bruk rå tekst
        msg = text || `Login failed ${res.status}`;
      }
    } else {
      msg = `Login failed ${res.status}`;
    }

    throw new Error(msg);
  }
  
  const data = await res.json();
  const token: string = data.token;

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
          const allErrors = Object.values(errJson.errors)
            .flat()
            .filter((x) => typeof x === "string") as string[];

          if (allErrors.length > 0) {
            msg = allErrors[0];
          }
        }
      } catch {
        msg = text;
      }
    } else {
      msg = `Registration failed ${res.status}`;
    }

    throw new Error(msg);
  }

  try {
    const json = JSON.parse(text);
    return json;
  } catch {
    return null;
  }
}