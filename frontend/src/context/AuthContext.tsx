import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, logoutApi, type LoginRequest } from "../services/AuthService";
import { jwtDecode } from "jwt-decode";

interface AuthContextValue {
  isAuthenticated: boolean;
  email: string | null;
  role: string | null;
  token: string | null;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      setEmail(decoded.email ?? null);
      setRole(
        decoded.role ??
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
        null
      );
    } catch {
      logoutApi();
      setToken(null);
      setEmail(null);
      setRole(null);
    }
  }, [token]);

  async function login(req: LoginRequest) {
    const result = await loginApi(req);
    setToken(result.token);
    setEmail(result.email);
    setRole(result.role);
  }

  function logout() {
    logoutApi();
    setToken(null);
    setEmail(null);
    setRole(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      email,
      role,
      login,
      logout
    }),
    [token, email, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
