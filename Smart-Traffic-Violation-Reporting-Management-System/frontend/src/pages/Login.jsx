import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, AlertCircle, Shield, User, KeyRound } from "lucide-react";
import { api } from "../services/api";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleQuickFillAdmin = () => {
    setFormData({
      email: "admin@traffic.gov",
      password: "Admin@123"
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.auth.login(formData);
      if (onLoginSuccess) onLoginSuccess(res.user);

      if (res.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/my-reports");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "440px", margin: "2rem auto" }}>
      <div className="card" style={{ padding: "2.25rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #2563EB, #06B6D4)",
            borderRadius: "var(--radius-md)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            marginBottom: "1rem"
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Sign in to access your citizen or admin portal
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem", padding: "0.75rem" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Quick Demo Fill Helper */}
        <div style={{
          marginTop: "1.75rem",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px dashed var(--border-color)",
          textAlign: "center"
        }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Admin Credentials: <strong>admin@traffic.gov</strong> / <strong>Admin@123</strong>
          </p>
          <button
            type="button"
            onClick={handleQuickFillAdmin}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.8rem" }}
          >
            <KeyRound size={13} />
            <span>Fill Admin Credentials</span>
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#60A5FA", fontWeight: 600 }}>
            Register as Citizen
          </Link>
        </div>
      </div>
    </div>
  );
}
