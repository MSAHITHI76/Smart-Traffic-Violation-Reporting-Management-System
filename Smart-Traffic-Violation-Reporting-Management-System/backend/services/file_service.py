import os
import uuid
from werkzeug.utils import secure_filename
from config import Config

def ensure_upload_dir():
    """Creates the upload folder if it does not already exist."""
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

def get_file_extension(filename: str) -> str:
    """Extracts lowercase file extension without the dot."""
    if "." in filename:
        return filename.rsplit(".", 1)[1].lower()
    return ""

def is_allowed_file(filename: str) -> bool:
    """Checks if the file extension is among allowed image or video formats."""
    ext = get_file_extension(filename)
    return ext in Config.ALLOWED_EXTENSIONS

def determine_file_type(filename: str) -> str:
    """Determines whether a file is an image or video based on its extension."""
    ext = get_file_extension(filename)
    if ext in Config.ALLOWED_IMAGE_EXTENSIONS:
        return "image"
    elif ext in Config.ALLOWED_VIDEO_EXTENSIONS:
        return "video"
    return "image"

def save_uploaded_file(file_storage):
    """
    Saves an incoming Werkzeug FileStorage object to the upload folder.
    Returns metadata dict: {file_path, file_name, file_type, file_size}.
    """
    ensure_upload_dir()
    original_name = secure_filename(file_storage.filename)
    if not original_name:
        original_name = f"evidence_{uuid.uuid4().hex[:8]}"

    ext = get_file_extension(original_name)
    unique_filename = f"{uuid.uuid4().hex}_{original_name}"
    target_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)

    file_storage.save(target_path)
    file_size = os.path.getsize(target_path) if os.path.exists(target_path) else 0
    file_type = determine_file_type(original_name)

    return {
        "file_path": unique_filename,
        "file_name": original_name,
        "file_type": file_type,
        "file_size": file_size
    }

def delete_uploaded_file(unique_filename: str):
    """Deletes a file from the uploads directory if it exists."""
    target_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
    if os.path.exists(target_path):
        try:
            os.remove(target_path)
        except OSError:
            pass
