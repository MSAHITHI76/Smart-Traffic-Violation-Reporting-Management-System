import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UploadCloud, AlertCircle, CheckCircle2, MapPin, Calendar, 
  FileText, X, Video, Image as ImageIcon, Send, Navigation 
} from "lucide-react";
import { api } from "../services/api";

const VIOLATION_TYPES = [
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

export default function ReportViolation() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Helper to get local ISO string formatted for <input type="datetime-local">
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    violation_type: "Red Light Violation",
    description: "",
    location: "",
    incident_date: getCurrentDateTimeLocal()
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Geolocation helper
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordsString = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
        setFormData((prev) => ({
          ...prev,
          location: prev.location ? `${prev.location} (${coordsString})` : coordsString
        }));
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setError("Unable to retrieve location automatically. Please type the address manually.");
      },
      { timeout: 10000 }
    );
  };

  // File handling
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = [];
    const validPreviews = [];

    newFiles.forEach((file) => {
      // Check size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError(`File ${file.name} exceeds maximum 50MB limit.`);
        return;
      }

      validFiles.push(file);
      const isVideo = file.type.startsWith("video/");
      validPreviews.push({
        name: file.name,
        type: isVideo ? "video" : "image",
        url: URL.createObjectURL(file),
        size: (file.size / (1024 * 1024)).toFixed(2)
      });
    });

    setFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...validPreviews]);
  };

  const handleRemoveFile = (index) => {
    // Revoke object URL
    URL.revokeObjectURL(filePreviews[index].url);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.violation_type || !formData.description || !formData.location || !formData.incident_date) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("violation_type", formData.violation_type);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("incident_date", formData.incident_date);

      files.forEach((file) => {
        data.append("evidence", file);
      });

      const res = await api.reports.submit(data);
      setSuccessMsg("Violation report submitted successfully! Redirecting to your dashboard...");

      setTimeout(() => {
        navigate("/my-reports");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to submit traffic violation report.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Submit Traffic Violation Report
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.35rem" }}>
          Provide accurate incident details and attach clear photo or video evidence for official review.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: "2.25rem" }}>
        {/* Row 1: Violation Type & Incident Date */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="violation_type">Violation Type *</label>
            <select
              id="violation_type"
              name="violation_type"
              className="form-select"
              value={formData.violation_type}
              onChange={handleChange}
              required
            >
              {VIOLATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="incident_date">Date &amp; Time of Incident *</label>
            <input
              id="incident_date"
              type="datetime-local"
              name="incident_date"
              className="form-input"
              value={formData.incident_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Row 2: Location */}
        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="form-label" htmlFor="location">Incident Location *</label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={geoLoading}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}
            >
              <Navigation size={13} />
              <span>{geoLoading ? "Locating..." : "Use Current GPS"}</span>
            </button>
          </div>
          <input
            id="location"
            type="text"
            name="location"
            className="form-input"
            placeholder="e.g. 5th Avenue &amp; 42nd Street, Main Crossway"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        {/* Row 3: Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">Detailed Description *</label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            placeholder="Describe the vehicle (make, model, color, license plate if visible), sequence of events, and any road hazard created..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Row 4: Evidence File Upload Dropzone */}
        <div className="form-group">
          <label className="form-label">Photo / Video Evidence (Max 50MB per file)</label>
          <div
            className="dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
            />
            <div className="dropzone-icon">
              <UploadCloud size={38} strokeWidth={1.5} />
            </div>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Click to browse or drag and drop evidence files
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Supports JPG, PNG, WEBP, MP4, MOV, and WEBM formats
            </p>
          </div>

          {/* Previews */}
          {filePreviews.length > 0 && (
            <div className="dropzone-previews">
              {filePreviews.map((preview, index) => (
                <div key={index} className="preview-card">
                  {preview.type === "video" ? (
                    <video src={preview.url} />
                  ) : (
                    <img src={preview.url} alt={preview.name} />
                  )}
                  <button
                    type="button"
                    className="preview-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    title="Remove file"
                  >
                    <X size={13} />
                  </button>
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.6)",
                    fontSize: "9px",
                    padding: "2px 4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {preview.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "1.5rem", padding: "0.85rem", fontSize: "1rem" }}
          disabled={loading}
        >
          <Send size={17} />
          <span>{loading ? "Uploading & Submitting..." : "Submit Violation Report"}</span>
        </button>
      </form>
    </div>
  );
}
