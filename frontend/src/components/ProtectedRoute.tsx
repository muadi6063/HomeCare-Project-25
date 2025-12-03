import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Checks authentication and optional role authorization
export const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  roles?: string[];
}> = ({ children, roles }) => {
  const { isAuthenticated, role } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if roles are specified
  if (roles && roles.length > 0) {
    if (!role || !roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  // Authorized -> render protected content
  return children;
};