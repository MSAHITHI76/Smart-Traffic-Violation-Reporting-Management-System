import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from config import Config
from database import init_db
from routes.auth_routes import auth_bp
from routes.report_routes import report_bp
from routes.admin_routes import admin_bp

def create_app():
    """Application factory for the Traffic Violation Reporting Backend."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend clients
    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/uploads/*": {"origins": "*"}})

    # Ensure uploads directory exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)

    # Static file serving for evidence (images / videos)
    @app.route("/uploads/<path:filename>", methods=["GET"])
    @app.route("/api/uploads/<path:filename>", methods=["GET"])
    def serve_upload(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    # System Health Check
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "online",
            "system": "Smart Traffic Violation Reporting & Management System",
            "version": "1.0.0"
        }), 200

    # Centralized JSON Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "message": "Bad Request", "details": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({
            "success": False,
            "message": "File exceeds maximum allowed size (50MB limit)"
        }), 413

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"success": False, "message": "Internal server error occurred"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    # Initialize DB schema and seed default admin
    init_db()
    port = int(os.getenv("PORT", 5000))
    print(f"Starting Smart Traffic Violation Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
