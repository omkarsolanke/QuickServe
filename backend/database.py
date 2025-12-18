from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
import sqlite3
from sqlalchemy import text
SQLALCHEMY_DATABASE_URL = "sqlite:///./quickserve.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# ✅ ENABLE SQLITE FOREIGN KEYS (CRITICAL)
@event.listens_for(Engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_request_location_columns(db):
    cols = db.execute(text("PRAGMA table_info(requests)")).fetchall()
    existing = {c[1] for c in cols}

    if "customer_lat" not in existing:
        db.execute(text("ALTER TABLE requests ADD COLUMN customer_lat REAL"))
    if "customer_lng" not in existing:
        db.execute(text("ALTER TABLE requests ADD COLUMN customer_lng REAL"))

    db.commit()