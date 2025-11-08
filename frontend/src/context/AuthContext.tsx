import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, logoutApi, type LoginRequest } from "../services/AuthService";
import { jwtDecode } from "jwt-decode";

interface AuthContextValue {
  isAuthenticated: boolean;
  email: string | null;
  role: string | null;
  token: string | null;
  userId: string | null;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function pickUserId(d: any) {
  return (
    d?.nameid ??
    d?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
    d?.uid ??
    null
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // ← NY

  useEffect(() => {
    if (!token) return;

    try {
      const d: any = jwtDecode(token);
      setEmail(d?.email ?? null);
      setRole(
        d?.role ??
          d?.roles ??
          d?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
          null
      );
      setUserId(pickUserId(d));
    } catch {
      logoutApi();
      setToken(null);
      setEmail(null);
      setRole(null);
      setUserId(null);
    }
  }, [token]);

  async function login(req: LoginRequest) {
    const result = await loginApi(req);
    setToken(result.token);
    setEmail(result.email);
    setRole(result.role);
    setUserId(result.userId);
  }

  function logout() {
    logoutApi();
    setToken(null);
    setEmail(null);
    setRole(null);
    setUserId(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      email,
      role,
      userId,
      login,
      logout,
    }),
    [token, email, role, userId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
