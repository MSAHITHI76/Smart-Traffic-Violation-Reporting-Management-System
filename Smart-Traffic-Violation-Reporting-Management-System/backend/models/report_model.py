from database import get_db

class ReportModel:
    @staticmethod
    def create_report(user_id, violation_type, description, location, incident_date):
        """Creates a new violation report and returns the generated report ID."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO traffic_violation_reports 
                    (user_id, violation_type, description, location, incident_date, status)
                    VALUES (%s, %s, %s, %s, %s, 'PENDING');
                """, (user_id, violation_type, description, location, incident_date))
                return cursor.lastrowid

    @staticmethod
    def add_evidence(report_id, file_path, file_name, file_type, file_size):
        """Attaches an evidence file record to a report."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO report_evidence 
                    (report_id, file_path, file_name, file_type, file_size)
                    VALUES (%s, %s, %s, %s, %s);
                """, (report_id, file_path, file_name, file_type, file_size))
                return cursor.lastrowid

    @staticmethod
    def get_evidence_for_report(report_id):
        """Retrieves all evidence records associated with a report ID."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, report_id, file_path, file_name, file_type, file_size, uploaded_at
                    FROM report_evidence
                    WHERE report_id = %s
                    ORDER BY id ASC;
                """, (report_id,))
                return cursor.fetchall()

    @staticmethod
    def get_reports_by_user(user_id):
        """Retrieves all reports submitted by a specific citizen with attached evidence."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT r.id, r.user_id, r.violation_type, r.description, r.location,
                           r.incident_date, r.status, r.admin_notes, r.created_at, r.updated_at
                    FROM traffic_violation_reports r
                    WHERE r.user_id = %s
                    ORDER BY r.created_at DESC;
                """, (user_id,))
                reports = cursor.fetchall()

                for report in reports:
                    report["incident_date"] = report["incident_date"].isoformat() if report["incident_date"] else None
                    report["created_at"] = report["created_at"].isoformat() if report["created_at"] else None
                    report["updated_at"] = report["updated_at"].isoformat() if report["updated_at"] else None
                    report["evidence"] = ReportModel.get_evidence_for_report(report["id"])
                    for ev in report["evidence"]:
                        ev["uploaded_at"] = ev["uploaded_at"].isoformat() if ev.get("uploaded_at") else None

                return reports

    @staticmethod
    def get_all_reports(status=None, violation_type=None, search=None):
        """Retrieves all reports for admin review with filtering support."""
        query = """
            SELECT r.id, r.user_id, u.name as citizen_name, u.email as citizen_email, u.phone as citizen_phone,
                   r.violation_type, r.description, r.location, r.incident_date, r.status,
                   r.admin_notes, r.created_at, r.updated_at
            FROM traffic_violation_reports r
            JOIN users u ON r.user_id = u.id
            WHERE 1=1
        """
        params = []

        if status and status.upper() != "ALL":
            query += " AND r.status = %s"
            params.append(status.upper())

        if violation_type and violation_type.upper() != "ALL":
            query += " AND r.violation_type = %s"
            params.append(violation_type)

        if search:
            query += " AND (r.location LIKE %s OR r.description LIKE %s OR u.name LIKE %s OR r.violation_type LIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern, search_pattern, search_pattern])

        query += " ORDER BY r.created_at DESC;"

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, tuple(params))
                reports = cursor.fetchall()

                for report in reports:
                    report["incident_date"] = report["incident_date"].isoformat() if report["incident_date"] else None
                    report["created_at"] = report["created_at"].isoformat() if report["created_at"] else None
                    report["updated_at"] = report["updated_at"].isoformat() if report["updated_at"] else None
                    report["evidence"] = ReportModel.get_evidence_for_report(report["id"])
                    for ev in report["evidence"]:
                        ev["uploaded_at"] = ev["uploaded_at"].isoformat() if ev.get("uploaded_at") else None

                return reports

    @staticmethod
    def get_report_by_id(report_id):
        """Retrieves a single report by ID along with submitter and evidence details."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT r.id, r.user_id, u.name as citizen_name, u.email as citizen_email, u.phone as citizen_phone,
                           r.violation_type, r.description, r.location, r.incident_date, r.status,
                           r.admin_notes, r.created_at, r.updated_at
                    FROM traffic_violation_reports r
                    JOIN users u ON r.user_id = u.id
                    WHERE r.id = %s;
                """, (report_id,))
                report = cursor.fetchone()

                if report:
                    report["incident_date"] = report["incident_date"].isoformat() if report["incident_date"] else None
                    report["created_at"] = report["created_at"].isoformat() if report["created_at"] else None
                    report["updated_at"] = report["updated_at"].isoformat() if report["updated_at"] else None
                    report["evidence"] = ReportModel.get_evidence_for_report(report["id"])
                    for ev in report["evidence"]:
                        ev["uploaded_at"] = ev["uploaded_at"].isoformat() if ev.get("uploaded_at") else None

                return report

    @staticmethod
    def update_status(report_id, status, admin_notes=None):
        """Updates the status and optional review notes for a report."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE traffic_violation_reports
                    SET status = %s, admin_notes = %s
                    WHERE id = %s;
                """, (status, admin_notes, report_id))
                return cursor.rowcount > 0

    @staticmethod
    def delete_report(report_id):
        """Deletes a report and associated evidence (via CASCADE)."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM traffic_violation_reports WHERE id = %s;", (report_id,))
                return cursor.rowcount > 0

    @staticmethod
    def get_stats():
        """Returns aggregate metrics for the admin dashboard."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                        SUM(CASE WHEN status = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
                        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved
                    FROM traffic_violation_reports;
                """)
                stats = cursor.fetchone()
                return {
                    "total": int(stats["total"] or 0),
                    "pending": int(stats["pending"] or 0),
                    "verified": int(stats["verified"] or 0),
                    "rejected": int(stats["rejected"] or 0),
                    "resolved": int(stats["resolved"] or 0)
                }
