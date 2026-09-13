import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, CheckCircle, XCircle, Clock, Trash2, Edit3, 
  Search, Filter, RefreshCw, AlertCircle, CheckCircle2, Eye, 
  MapPin, User, Calendar, MessageSquare, Video, Image as ImageIcon
} from "lucide-react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import EvidenceModal from "../components/EvidenceModal";

const VIOLATION_TYPES = [
  "ALL",
  "Red Light Violation",
  "Speeding",
  "Illegal Parking",
  "Reckless Driving",
  "No Helmet / Seatbelt",
  "Driving in Wrong Direction",
  "Using Mobile While Driving",
  "Drunk Driving",
  "Overloading",
  "Other"
];

const STATUS_OPTIONS = ["ALL", "PENDING", "VERIFIED", "REJECTED", "RESOLVED"];

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterViolation, setFilterViolation] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedReport, setSelectedReport] = useState(null); // For Review / Status edit modal
  const [updateStatus, setUpdateStatus] = useState("VERIFIED");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [activeEvidence, setActiveEvidence] = useState(null); // For full media lightbox

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsData, statsData] = await Promise.all([
        api.admin.getReports({
          status: filterStatus,
          violation_type: filterViolation,
          search: searchTerm,
        }),
        api.admin.getStats(),
      ]);

      setReports(reportsData.reports || []);
      setStats(statsData.stats || { total: 0, pending: 0, verified: 0, rejected: 0, resolved: 0 });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterViolation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenReviewModal = (report) => {
    setSelectedReport(report);
    setUpdateStatus(report.status || "VERIFIED");
    setUpdateNotes(report.admin_notes || "");
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsUpdating(true);
    try {
      await api.admin.updateStatus(selectedReport.id, {
        status: updateStatus,
        admin_notes: updateNotes,
      });

      setNotification(`Report #${selectedReport.id} successfully updated to ${updateStatus}`);
      setSelectedReport(null);
      fetchData();
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update report status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(`Are you sure you want to permanently delete report #${reportId}?`)) {
      return;
    }

    try {
      await api.admin.deleteReport(reportId);
      setNotification(`Report #${reportId} deleted successfully`);
      fetchData();
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete report record");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="role-pill admin">Official Authority Portal</span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, marginTop: "0.25rem" }}>
            Traffic Enforcement Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Review citizen evidence submissions, verify traffic violations, and enforce penalties.
          </p>
        </div>

        <button onClick={fetchData} className="btn btn-secondary" disabled={loading}>
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: "rgba(37, 99, 235, 0.15)", color: "#60A5FA" }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="metric-number">{stats.total}</div>
            <div className="metric-label">Total Reports</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="metric-number">{stats.pending}</div>
            <div className="metric-label">Pending Review</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="metric-number">{stats.verified}</div>
            <div className="metric-label">Verified Violations</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#F87171" }}>
            <XCircle size={24} />
          </div>
          <div>
            <div className="metric-number">{stats.rejected}</div>
            <div className="metric-label">Rejected Submissions</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "2", minWidth: "220px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search by location, citizen name, or keywords..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          </div>

          <div style={{ flex: "1", minWidth: "160px" }}>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  Status: {status}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1.2", minWidth: "180px" }}>
            <select
              className="form-select"
              value={filterViolation}
              onChange={(e) => setFilterViolation(e.target.value)}
            >
              {VIOLATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "ALL" ? "All Violation Types" : type}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: "0.7rem 1.25rem" }}>
            Filter
          </button>
        </form>
      </div>

      {/* Reports Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Citizen Details</th>
              <th>Violation</th>
              <th>Location &amp; Date</th>
              <th>Evidence</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  Loading violation records...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No violation reports matching criteria.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td style={{ fontWeight: 700, color: "var(--text-muted)" }}>
                    #{report.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{report.citizen_name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {report.citizen_email}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{report.violation_type}</div>
                    <div style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      maxWidth: "240px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {report.description}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.88rem" }}>{report.location}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {new Date(report.incident_date).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    {report.evidence && report.evidence.length > 0 ? (
                      <div className="evidence-thumbnails">
                        {report.evidence.map((ev, idx) => (
                          <button
                            key={ev.id || idx}
                            className="evidence-thumb-btn"
                            style={{ width: "38px", height: "38px" }}
                            onClick={() => setActiveEvidence({ list: report.evidence, index: idx })}
                            title={ev.file_name}
                          >
                            {ev.file_type === "video" ? (
                              <Video size={14} style={{ color: "var(--accent-cyan)" }} />
                            ) : (
                              <img src={api.getEvidenceUrl(ev.file_path)} alt="" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No files</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={report.status} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenReviewModal(report)}
                        title="Review and Update Status"
                      >
                        <Edit3 size={14} />
                        <span>Review</span>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteReport(report.id)}
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review & Status Update Modal */}
      {selectedReport && (
        <div className="modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                  Review Violation #{selectedReport.id}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Submitted by {selectedReport.citizen_name} ({selectedReport.citizen_email})
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>
                <XCircle size={20} />
              </button>
            </div>

            {/* Incident Summary Card */}
            <div style={{
              background: "var(--bg-surface-elevated)",
              padding: "1rem 1.25rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {selectedReport.violation_type}
                </span>
                <StatusBadge status={selectedReport.status} />
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                <strong>Location:</strong> {selectedReport.location}
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                <strong>Incident Time:</strong> {new Date(selectedReport.incident_date).toLocaleString()}
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", background: "rgba(0,0,0,0.2)", padding: "0.65rem", borderRadius: "var(--radius-sm)" }}>
                "{selectedReport.description}"
              </p>

              {/* Evidence review in modal */}
              {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                    Attached Evidence ({selectedReport.evidence.length} files - click to expand):
                  </div>
                  <div className="evidence-thumbnails">
                    {selectedReport.evidence.map((ev, idx) => (
                      <button
                        key={ev.id || idx}
                        className="evidence-thumb-btn"
                        style={{ width: "54px", height: "54px" }}
                        onClick={() => setActiveEvidence({ list: selectedReport.evidence, index: idx })}
                      >
                        {ev.file_type === "video" ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "var(--accent-cyan)" }}>
                            <Video size={18} />
                            <span style={{ fontSize: "8px" }}>VIDEO</span>
                          </div>
                        ) : (
                          <img src={api.getEvidenceUrl(ev.file_path)} alt="" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Form */}
            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">Update Verification Status</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                  <button
                    type="button"
                    className={`btn ${updateStatus === "VERIFIED" ? "btn-success" : "btn-secondary"}`}
                    onClick={() => setUpdateStatus("VERIFIED")}
                  >
                    <CheckCircle size={16} />
                    <span>Verify (Approved)</span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${updateStatus === "REJECTED" ? "btn-danger" : "btn-secondary"}`}
                    onClick={() => setUpdateStatus("REJECTED")}
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${updateStatus === "RESOLVED" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setUpdateStatus("RESOLVED")}
                  >
                    <ShieldAlert size={16} />
                    <span>Mark Resolved</span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${updateStatus === "PENDING" ? "btn-secondary" : "btn-secondary"}`}
                    style={{ borderColor: updateStatus === "PENDING" ? "var(--status-pending-text)" : "" }}
                    onClick={() => setUpdateStatus("PENDING")}
                  >
                    <Clock size={16} />
                    <span>Keep Pending</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin_notes">
                  Official Administrative Remarks / Citation Notes
                </label>
                <textarea
                  id="admin_notes"
                  className="form-textarea"
                  placeholder="e.g. Verified license plate #ABC-1234. Penalty ticket issued pursuant to Traffic Code Sec 42-A..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedReport(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving Decision..." : "Confirm & Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
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
