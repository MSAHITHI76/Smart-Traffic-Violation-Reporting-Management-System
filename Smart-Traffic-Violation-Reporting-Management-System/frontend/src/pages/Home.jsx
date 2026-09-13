import React from "react";
import { Link } from "react-router-dom";
import { Shield, Camera, FileCheck, Eye, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { getStoredUser } from "../services/api";

export default function Home() {
  const user = getStoredUser();

  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: "center", padding: "3rem 1rem 4rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(37, 99, 235, 0.12)",
          border: "1px solid rgba(37, 99, 235, 0.3)",
          color: "#60A5FA",
          padding: "0.35rem 0.9rem",
          borderRadius: "9999px",
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "1.5rem"
        }}>
          <Shield size={14} />
          <span>Next-Generation Citizen Traffic Enforcement</span>
        </div>

        <h1 style={{
          fontSize: "2.8rem",
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: "-0.03em",
          marginBottom: "1.25rem",
          background: "linear-gradient(135deg, #FFFFFF 30%, #94A3B8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Smart Traffic Violation Reporting &amp; Management System
        </h1>

        <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "2.5rem" }}>
          Empowering citizens to report reckless driving and traffic infractions directly to authorities. 
          Upload photo and video evidence, track review status in real time, and promote safer streets.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          {user?.role === "admin" ? (
            <Link to="/admin" className="btn btn-primary" style={{ padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
              <span>Open Admin Dashboard</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/report" className="btn btn-primary" style={{ padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
                <Camera size={18} />
                <span>Report a Violation</span>
              </Link>
              <Link to={user ? "/my-reports" : "/login"} className="btn btn-secondary" style={{ padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
                <span>Track My Reports</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        marginBottom: "4rem"
      }}>
        <div className="card">
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            background: "rgba(37, 99, 235, 0.15)",
            color: "#60A5FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem"
          }}>
            <Camera size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Instant Evidence Upload
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Submit clear photographic and video evidence with geolocation, exact timestamps, and categorized violation types.
          </p>
        </div>

        <div className="card">
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            background: "rgba(16, 185, 129, 0.15)",
            color: "#34D399",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem"
          }}>
            <Eye size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Transparent Status Tracking
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Stay updated as law enforcement verifies, resolves, or provides notes on your submitted incident reports.
          </p>
        </div>

        <div className="card">
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            background: "rgba(99, 102, 241, 0.15)",
            color: "#818CF8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem"
          }}>
            <FileCheck size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Official Enforcement Review
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Centralized administrative console for traffic officers to inspect high-resolution media, verify claims, and penalize violators.
          </p>
        </div>
      </div>

      {/* How it works workflow */}
      <div className="card" style={{ padding: "2.5rem 2rem", background: "linear-gradient(180deg, var(--bg-surface) 0%, rgba(18, 24, 38, 0.5) 100%)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, textAlign: "center", marginBottom: "2rem" }}>
          How the Reporting Process Works
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>01</span>
            <h4 style={{ fontWeight: 600, fontSize: "1.05rem" }}>Record Incident</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Encounter a violation? Capture the vehicle, license plate, and violation context with your phone.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)" }}>02</span>
            <h4 style={{ fontWeight: 600, fontSize: "1.05rem" }}>Submit Report</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Enter location, select the violation category, attach media files, and submit via our secure portal.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "#10B981" }}>03</span>
            <h4 style={{ fontWeight: 600, fontSize: "1.05rem" }}>Official Action</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Traffic department administrators inspect evidence, issue citations, and notify you when resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
