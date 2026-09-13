import re
from flask import Blueprint, request, jsonify
from models.user_model import UserModel
from services.auth_service import hash_password, verify_password, generate_token, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

@auth_bp.route("/register", methods=["POST"])
def register():
    """Citizen registration endpoint."""
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = (data.get("phone") or "").strip()

    if not name:
        return jsonify({"success": False, "message": "Full name is required"}), 400

    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"success": False, "message": "A valid email address is required"}), 400

    if not password or len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters long"}), 400

    existing_user = UserModel.find_by_email(email)
    if existing_user:
        return jsonify({"success": False, "message": "An account with this email already exists"}), 409

    hashed_pw = hash_password(password)
    user_id = UserModel.create_user(name, email, hashed_pw, phone, role="citizen")

    token = generate_token(user_id, email, "citizen")

    return jsonify({
        "success": True,
        "message": "Citizen account registered successfully",
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "phone": phone,
            "role": "citizen"
        }
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    """Authentication endpoint for both Citizens and Admins."""
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Both email and password are required"}), 400

    user = UserModel.find_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    token = generate_token(user["id"], user["email"], user["role"])

    return jsonify({
        "success": True,
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone"),
            "role": user["role"]
        }
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    """Returns the authenticated user profile."""
    return jsonify({
        "success": True,
        "user": current_user
    }), 200
