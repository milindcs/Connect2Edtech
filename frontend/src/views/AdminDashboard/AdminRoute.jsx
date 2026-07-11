import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../shared/AuthContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isStaff, loading } = useAuth();

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
}
