import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, logoutApi, type LoginRequest } from "../services/AuthService";
import { jwtDecode } from "jwt-decode";

interface AuthContextValue {
  isAuthenticated: boolean;
  email: string | null;
  role: string | null;
  token: string | null;
  userId: string | null;
  name: string | null;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Extract user ID from JWT claims (different claim names from .NET Identity)
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
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); 

    // Decode JWT token and extract user info when token changes
  useEffect(() => {
    if (!token) return;

    try {
      const d: any = jwtDecode(token);
      setEmail(d?.email ?? null);
      setName(
        d?.name ?? 
        d?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? 
        null
      );
      setRole(
        d?.role ??
          d?.roles ??
          d?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
          null
      );
      setUserId(pickUserId(d));
    } catch {
      // Invalid token - clear auth state
      logoutApi();
      setToken(null);
      setEmail(null);
      setName(null);
      setRole(null);
      setUserId(null);
    }
  }, [token]);

  async function login(req: LoginRequest) {
    const result = await loginApi(req);
    setToken(result.token);
  }

  function logout() {
    logoutApi();
    setToken(null);
    setEmail(null);
    setName(null);
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
      name,
      login,
      logout,
    }),
    [token, email, name, role, userId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
