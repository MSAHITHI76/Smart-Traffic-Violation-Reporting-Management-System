from flask import Blueprint, request, jsonify
from services.auth_service import admin_required
from models.report_model import ReportModel

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

VALID_STATUSES = ["PENDING", "VERIFIED", "REJECTED", "RESOLVED"]

@admin_bp.route("/reports", methods=["GET"])
@admin_required
def get_all_reports(current_user):
    """
    Lists all violation reports with optional filtering by status,
    violation_type, and text search (location, citizen name, description).
    """
    status = request.args.get("status")
    violation_type = request.args.get("violation_type")
    search = request.args.get("search")

    try:
        reports = ReportModel.get_all_reports(status=status, violation_type=violation_type, search=search)
        return jsonify({
            "success": True,
            "count": len(reports),
            "reports": reports
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to retrieve reports: {str(e)}"}), 500

@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats(current_user):
    """Provides summary metric counts for the Admin Dashboard."""
    try:
        stats = ReportModel.get_stats()
        return jsonify({
            "success": True,
            "stats": stats
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to calculate stats: {str(e)}"}), 500

@admin_bp.route("/reports/<int:report_id>/status", methods=["PUT"])
@admin_required
def update_report_status(current_user, report_id):
    """
    Updates the verification status of a report (VERIFIED, REJECTED, RESOLVED, PENDING)
    and allows recording official administrative remarks.
    """
    data = request.get_json() or {}
    status = (data.get("status") or "").upper().strip()
    admin_notes = data.get("admin_notes", "").strip()

    if status not in VALID_STATUSES:
        return jsonify({
            "success": False,
            "message": f"Invalid status '{status}'. Must be one of: {', '.join(VALID_STATUSES)}"
        }), 400

    report = ReportModel.get_report_by_id(report_id)
    if not report:
        return jsonify({"success": False, "message": "Report record not found"}), 404

    success = ReportModel.update_status(report_id, status, admin_notes)
    if success:
        updated_report = ReportModel.get_report_by_id(report_id)
        return jsonify({
            "success": True,
            "message": f"Report #{report_id} status updated to '{status}'",
            "report": updated_report
        }), 200

    return jsonify({"success": False, "message": "Failed to update report"}), 500

@admin_bp.route("/reports/<int:report_id>", methods=["DELETE"])
@admin_required
def delete_report(current_user, report_id):
    """Deletes a traffic violation record from the system."""
    report = ReportModel.get_report_by_id(report_id)
    if not report:
        return jsonify({"success": False, "message": "Report not found"}), 404

    success = ReportModel.delete_report(report_id)
    if success:
        return jsonify({
            "success": True,
            "message": f"Report #{report_id} deleted successfully"
        }), 200

    return jsonify({"success": False, "message": "Failed to delete report"}), 500
