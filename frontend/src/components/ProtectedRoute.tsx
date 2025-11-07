import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  roles?: string[];
}> = ({ children, roles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    if (!role || !roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};