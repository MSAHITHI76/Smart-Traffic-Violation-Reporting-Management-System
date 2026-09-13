import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  PlusCircle, RefreshCw, AlertCircle, FileText, 
  Calendar, MapPin, MessageSquare, Image as ImageIcon, Video 
} from "lucide-react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import EvidenceModal from "../components/EvidenceModal";

export default function CitizenDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeEvidence, setActiveEvidence] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.reports.getMyReports();
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Summary counts
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const verifiedCount = reports.filter((r) => r.status === "VERIFIED").length;
  const rejectedCount = reports.filter((r) => r.status === "REJECTED").length;

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>My Submitted Reports</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Track the verification progress and enforcement status of your reported violations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={fetchReports} className="btn btn-secondary" title="Refresh List" disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link to="/report" className="btn btn-primary">
            <PlusCircle size={17} />
            <span>New Report</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: "rgba(37, 99, 235, 0.15)", color: "#60A5FA" }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="metric-number">{reports.length}</div>
            <div className="metric-label">Total Reports</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}>
            <RefreshCw size={24} />
          </div>
          <div>
            <div className="metric-number">{pendingCount}</div>
            <div className="metric-label">Under Review</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}>
            <StatusBadge status="VERIFIED" />
          </div>
          <div>
            <div className="metric-number">{verifiedCount}</div>
            <div className="metric-label">Verified Violations</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Loading your violation submissions...
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
            color: "var(--text-secondary)"
          }}>
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            No Violation Reports Yet
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
            You haven't submitted any traffic violations. Spot an infraction? Help keep roads safe by reporting it.
          </p>
          <Link to="/report" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Submit Your First Report</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {reports.map((report) => (
            <div key={report.id} className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      #{report.id}
                    </span>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
                      {report.violation_type}
                    </h3>
                    <StatusBadge status={report.status} />
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Calendar size={14} />
                  <span>Submitted {new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  <MapPin size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <span>{report.location}</span>
                  <span style={{ color: "var(--text-muted)" }}>•</span>
                  <span>Incident Time: {new Date(report.incident_date).toLocaleString()}</span>
                </div>

                <p style={{ color: "var(--text-primary)", fontSize: "0.92rem", lineHeight: 1.6, background: "rgba(255, 255, 255, 0.02)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)" }}>
                  {report.description}
                </p>
              </div>

              {/* Official Review Feedback Notes */}
              {report.admin_notes && (
                <div style={{
                  background: "rgba(37, 99, 235, 0.08)",
                  borderLeft: "3px solid var(--primary)",
                  padding: "0.75rem 1rem",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  marginBottom: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 700, color: "#60A5FA", marginBottom: "0.25rem" }}>
                    <MessageSquare size={13} />
                    <span>Official Authority Review Remarks:</span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
                    {report.admin_notes}
                  </p>
                </div>
              )}

              {/* Evidence Media Section */}
              {report.evidence && report.evidence.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Attached Evidence ({report.evidence.length} file{report.evidence.length > 1 ? "s" : ""}):
                  </div>
                  <div className="evidence-thumbnails">
                    {report.evidence.map((ev, idx) => (
                      <button
                        key={ev.id || idx}
                        className="evidence-thumb-btn"
                        onClick={() => setActiveEvidence({ list: report.evidence, index: idx })}
                        title={`View ${ev.file_name}`}
                      >
                        {ev.file_type === "video" ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: "var(--accent-cyan)" }}>
                            <Video size={16} />
                            <span style={{ fontSize: "9px" }}>VIDEO</span>
                          </div>
                        ) : (
                          <img src={api.getEvidenceUrl(ev.file_path)} alt={ev.file_name} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Evidence */}
      {activeEvidence && (
        <EvidenceModal
          evidenceList={activeEvidence.list}
          initialIndex={activeEvidence.index}
          onClose={() => setActiveEvidence(null)}
        />
      )}
    </div>
  );
}
