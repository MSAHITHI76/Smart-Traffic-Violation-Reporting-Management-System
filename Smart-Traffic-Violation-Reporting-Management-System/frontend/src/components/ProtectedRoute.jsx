import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getStoredUser } from "../services/api";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/my-reports"} replace />;
  }

  return children;
}
