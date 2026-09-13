import pymysql
import pymysql.cursors
from contextlib import contextmanager
from werkzeug.security import generate_password_hash
from config import Config

def get_connection(include_db=True):
    """Establishes and returns a direct PyMySQL connection."""
    kwargs = {
        "host": Config.DB_HOST,
        "port": Config.DB_PORT,
        "user": Config.DB_USER,
        "password": Config.DB_PASSWORD,
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": True,
        "charset": "utf8mb4"
    }
    if include_db:
        kwargs["database"] = Config.DB_NAME
    return pymysql.connect(**kwargs)

@contextmanager
def get_db():
    """Context manager for obtaining a database connection with auto-closure."""
    conn = get_connection(include_db=True)
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    """
    Initializes the database schema and creates essential tables and default admin.
    Safely runs during application startup.
    """
    try:
        # Step 1: Ensure database exists
        server_conn = get_connection(include_db=False)
        with server_conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        server_conn.close()

        # Step 2: Ensure tables exist
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Users table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS `users` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `name` VARCHAR(100) NOT NULL,
                        `email` VARCHAR(120) NOT NULL UNIQUE,
                        `password_hash` VARCHAR(255) NOT NULL,
                        `phone` VARCHAR(20) DEFAULT NULL,
                        `role` ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
                        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        INDEX `idx_users_email` (`email`),
                        INDEX `idx_users_role` (`role`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """)

                # Reports table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS `traffic_violation_reports` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `user_id` INT NOT NULL,
                        `violation_type` VARCHAR(100) NOT NULL,
                        `description` TEXT NOT NULL,
                        `location` VARCHAR(255) NOT NULL,
                        `incident_date` DATETIME NOT NULL,
                        `status` ENUM('PENDING', 'VERIFIED', 'REJECTED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
                        `admin_notes` TEXT DEFAULT NULL,
                        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                        INDEX `idx_reports_user_id` (`user_id`),
                        INDEX `idx_reports_status` (`status`),
                        INDEX `idx_reports_incident_date` (`incident_date`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """)

                # Evidence table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS `report_evidence` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `report_id` INT NOT NULL,
                        `file_path` VARCHAR(255) NOT NULL,
                        `file_name` VARCHAR(255) NOT NULL,
                        `file_type` ENUM('image', 'video') NOT NULL,
                        `file_size` INT NOT NULL DEFAULT 0,
                        `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT `fk_evidence_report` FOREIGN KEY (`report_id`) REFERENCES `traffic_violation_reports` (`id`) ON DELETE CASCADE,
                        INDEX `idx_evidence_report_id` (`report_id`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """)

                # Default Admin Account
                cursor.execute("SELECT id FROM `users` WHERE `email` = %s;", ("admin@traffic.gov",))
                admin = cursor.fetchone()
                if not admin:
                    admin_pw = generate_password_hash("Admin@123")
                    cursor.execute("""
                        INSERT INTO `users` (`name`, `email`, `password_hash`, `phone`, `role`)
                        VALUES (%s, %s, %s, %s, %s);
                    """, ("System Administrator", "admin@traffic.gov", admin_pw, "+1-800-555-0199", "admin"))
                    print("[Database] Default administrator account seeded: admin@traffic.gov / Admin@123")

        print(f"[Database] Successfully initialized database '{Config.DB_NAME}' and required tables.")
    except Exception as e:
        print(f"[Database Warning] Unable to initialize MySQL automatically: {e}")
        print("[Database Warning] Ensure MySQL is running and DB credentials in .env or config.py are correct.")
