# backend/seed_admin.py

from database import SessionLocal
from auth_utils import get_password_hash
import models


def create_admin():
    db = SessionLocal()
    try:
        email = "admin@quickserve.com"
        password = "admin123"

        # Check if admin already exists
        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            print(f"User with email {email} already exists, id={existing.id}")
            return

        # Create user row
        user = models.User(
            full_name="Admin",
            email=email,
            hashed_password=get_password_hash(password),
            role="admin",
        )
        db.add(user)
        db.flush()  # get user.id

        # Create admin row
        admin = models.Admin(user_id=user.id)
        db.add(admin)

        db.commit()
        print(f"Created admin user id={user.id}, email={email}")
    except Exception as e:
        db.rollback()
        print("Error creating admin:", e)
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
