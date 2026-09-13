from flask import Blueprint, request, jsonify
from datetime import datetime
from services.auth_service import token_required
from services.file_service import is_allowed_file, save_uploaded_file, delete_uploaded_file
from models.report_model import ReportModel

report_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

VALID_VIOLATION_TYPES = [
    "Speeding",
    "Red Light Violation",
    "Illegal Parking",
    "Reckless Driving",
    "No Helmet / Seatbelt",
    "Driving in Wrong Direction",
    "Using Mobile While Driving",
    "Drunk Driving",
    "Overloading",
    "Other"
]

@report_bp.route("", methods=["POST"])
@token_required
def submit_report(current_user):
    """
    Submits a new traffic violation report with optional photos/videos.
    Accepts multipart/form-data.
    """
    violation_type = (request.form.get("violation_type") or "").strip()
    description = (request.form.get("description") or "").strip()
    location = (request.form.get("location") or "").strip()
    incident_date_str = (request.form.get("incident_date") or "").strip()

    if not violation_type:
        return jsonify({"success": False, "message": "Violation type is required"}), 400

    if not description:
        return jsonify({"success": False, "message": "Detailed description is required"}), 400

    if not location:
        return jsonify({"success": False, "message": "Location is required"}), 400

    if not incident_date_str:
        return jsonify({"success": False, "message": "Date and time of incident are required"}), 400

    # Parse incident date/time safely
    try:
        # Handles ISO strings like 2025-05-14T15:30 or standard formats
        cleaned_date = incident_date_str.replace("T", " ")
        if len(cleaned_date) == 16:  # YYYY-MM-DD HH:MM
            cleaned_date += ":00"
        incident_date = datetime.strptime(cleaned_date, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            incident_date = datetime.fromisoformat(incident_date_str)
        except Exception:
            return jsonify({"success": False, "message": "Invalid date format. Expected YYYY-MM-DD HH:MM:SS"}), 400

    # Validate uploaded evidence files
    files = request.files.getlist("evidence")
    if not files or files[0].filename == "":
        files = request.files.getlist("files")

    saved_evidence_list = []
    saved_file_paths = []

    try:
        for file_item in files:
            if file_item and file_item.filename:
                if not is_allowed_file(file_item.filename):
                    # Clean up already saved files
                    for p in saved_file_paths:
                        delete_uploaded_file(p)
                    return jsonify({
                        "success": False,
                        "message": f"Unsupported file type: {file_item.filename}. Allowed: images (.jpg, .png, .webp) and videos (.mp4, .mov, .webm)"
                    }), 400

                meta = save_uploaded_file(file_item)
                saved_evidence_list.append(meta)
                saved_file_paths.append(meta["file_path"])

        # Insert report into database
        report_id = ReportModel.create_report(
            user_id=current_user["id"],
            violation_type=violation_type,
            description=description,
            location=location,
            incident_date=incident_date.strftime("%Y-%m-%d %H:%M:%S")
        )

        # Attach evidence records
        for ev in saved_evidence_list:
            ReportModel.add_evidence(
                report_id=report_id,
                file_path=ev["file_path"],
                file_name=ev["file_name"],
                file_type=ev["file_type"],
                file_size=ev["file_size"]
            )

        return jsonify({
            "success": True,
            "message": "Traffic violation report submitted successfully",
            "report_id": report_id
        }), 201

    except Exception as e:
        # Cleanup files if an unexpected error occurs
        for p in saved_file_paths:
            delete_uploaded_file(p)
        return jsonify({"success": False, "message": f"Error saving report: {str(e)}"}), 500

@report_bp.route("/my", methods=["GET"])
@token_required
def get_my_reports(current_user):
    """Retrieves all reports submitted by the logged-in citizen."""
    try:
        reports = ReportModel.get_reports_by_user(current_user["id"])
        return jsonify({
            "success": True,
            "count": len(reports),
            "reports": reports
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to fetch reports: {str(e)}"}), 500

@report_bp.route("/<int:report_id>", methods=["GET"])
@token_required
def get_report_details(current_user, report_id):
    """Retrieves details of a specific report with permissions check."""
    report = ReportModel.get_report_by_id(report_id)
    if not report:
        return jsonify({"success": False, "message": "Report not found"}), 404

    # Non-admins can only see their own reports
    if current_user["role"] != "admin" and report["user_id"] != current_user["id"]:
        return jsonify({"success": False, "message": "Access denied"}), 403

    return jsonify({
        "success": True,
        "report": report
    }), 200
