import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportViolation from "./pages/ReportViolation";
import CitizenDashboard from "./pages/CitizenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { getStoredUser, getToken } from "./services/api";

export default function App() {
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    // Sync state on load
    const stored = getStoredUser();
    const token = getToken();
    if (stored && token) {
      setUser(stored);
    } else {
      setUser(null);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar user={user} onLogout={() => setUser(null)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/my-reports"} replace /> : <Login onLoginSuccess={setUser} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/my-reports" replace /> : <Register onRegisterSuccess={setUser} />}
            />

            {/* Citizen Protected Routes */}
            <Route
              path="/report"
              element={
                <ProtectedRoute allowedRole="citizen">
                  <ReportViolation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute allowedRole="citizen">
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
