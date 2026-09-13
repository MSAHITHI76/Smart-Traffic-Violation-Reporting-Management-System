import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, PlusCircle, ListFilter, LayoutDashboard, LogOut, LogIn, UserPlus } from "lucide-react";
import { api, getStoredUser } from "../services/api";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    api.auth.logout();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-badge">
            <Shield size={20} />
          </div>
          <span>TrafficGuard</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>

          {user && user.role === "citizen" && (
            <>
              <Link to="/report" className={`nav-link ${isActive("/report") ? "active" : ""}`}>
                <PlusCircle size={16} />
                <span>Submit Report</span>
              </Link>
              <Link to="/my-reports" className={`nav-link ${isActive("/my-reports") ? "active" : ""}`}>
                <ListFilter size={16} />
                <span>My Reports</span>
              </Link>
            </>
          )}

          {user && user.role === "admin" && (
            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
              <LayoutDashboard size={16} />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>

        <div className="nav-auth">
          {user ? (
            <>
              <div className="user-profile-badge">
                <span>{user.name}</span>
                <span className={`role-pill ${user.role}`}>{user.role}</span>
              </div>
              <button onClick={handleLogoutClick} className="btn btn-secondary btn-sm" title="Log Out">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
