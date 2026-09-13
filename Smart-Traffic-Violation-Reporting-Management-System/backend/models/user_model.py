from database import get_db

class UserModel:
    @staticmethod
    def create_user(name, email, password_hash, phone=None, role="citizen"):
        """Creates a new user record in the database."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO users (name, email, password_hash, phone, role)
                    VALUES (%s, %s, %s, %s, %s);
                """, (name, email, password_hash, phone, role))
                return cursor.lastrowid

    @staticmethod
    def find_by_email(email):
        """Finds a single user by their email address."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, email, password_hash, phone, role, created_at
                    FROM users
                    WHERE email = %s;
                """, (email,))
                return cursor.fetchone()

    @staticmethod
    def find_by_id(user_id):
        """Finds a single user by their primary key ID."""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, email, phone, role, created_at
                    FROM users
                    WHERE id = %s;
                """, (user_id,))
                return cursor.fetchone()
