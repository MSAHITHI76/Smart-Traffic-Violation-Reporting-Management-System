import React from "react";
import { Clock, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export default function StatusBadge({ status }) {
  const normalized = (status || "PENDING").toUpperCase();

  let badgeClass = "pending";
  let Icon = Clock;
  let label = "Pending";

  switch (normalized) {
    case "VERIFIED":
      badgeClass = "verified";
      Icon = CheckCircle2;
      label = "Verified";
      break;
    case "REJECTED":
      badgeClass = "rejected";
      Icon = XCircle;
      label = "Rejected";
      break;
    case "RESOLVED":
      badgeClass = "resolved";
      Icon = ShieldCheck;
      label = "Resolved";
      break;
    default:
      badgeClass = "pending";
      Icon = Clock;
      label = "Pending Review";
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <Icon size={13} strokeWidth={2.5} />
      <span>{label}</span>
    </span>
  );
}
