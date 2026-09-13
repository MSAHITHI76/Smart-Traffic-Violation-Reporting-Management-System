import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react";
import { api } from "../services/api";

export default function EvidenceModal({ evidenceList, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, evidenceList]);

  if (!evidenceList || evidenceList.length === 0) return null;

  const currentItem = evidenceList[currentIndex];
  const fileUrl = api.getEvidenceUrl(currentItem.file_path);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : evidenceList.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < evidenceList.length - 1 ? prev + 1 : 0));
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Evidence {currentIndex + 1} of {evidenceList.length}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {currentItem.file_name} ({formatSize(currentItem.file_size)})
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ position: "relative", minHeight: "340px", display: "flex", alignItems: "center", justifyContent: "center", background: "#05070D", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1rem" }}>
          {currentItem.file_type === "video" ? (
            <video
              src={fileUrl}
              controls
              autoPlay
              style={{ maxHeight: "65vh", maxWidth: "100%", borderRadius: "var(--radius-md)" }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={fileUrl}
              alt={currentItem.file_name}
              style={{ maxHeight: "65vh", maxWidth: "100%", objectFit: "contain", borderRadius: "var(--radius-md)" }}
            />
          )}

          {evidenceList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                style={{
                  position: "absolute",
                  left: "12px",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={handleNext}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {evidenceList.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-sm)",
                  border: idx === currentIndex ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "var(--bg-surface-elevated)",
                  padding: 0,
                }}
              >
                {item.file_type === "video" ? (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)", fontSize: "10px" }}>
                    VID
                  </div>
                ) : (
                  <img src={api.getEvidenceUrl(item.file_path)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </button>
            ))}
          </div>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={currentItem.file_name}
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
}
