import jwt
import datetime
from functools import wraps
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models.user_model import UserModel

def hash_password(password: str) -> str:
    """Generates a secure password hash."""
    return generate_password_hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    """Verifies a plain text password against a stored hash."""
    return check_password_hash(password_hash, password)

def generate_token(user_id: int, email: str, role: str) -> str:
    """Generates a signed JWT authentication token."""
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    """Decodes and validates a JWT token."""
    try:
        return jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require a valid Bearer token on routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authentication token is missing"}), 401

        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"success": False, "message": "Invalid token header format. Use 'Bearer <token>'"}), 401

        token = parts[1]
        decoded = decode_token(token)
        if not decoded:
            return jsonify({"success": False, "message": "Token is invalid or has expired"}), 401

        current_user = UserModel.find_by_id(decoded.get("user_id"))
        if not current_user:
            return jsonify({"success": False, "message": "Associated user not found"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to restrict access strictly to users with role='admin'."""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.get("role") != "admin":
            return jsonify({"success": False, "message": "Administrator privileges required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated
