# backend/models.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    Text,
    DateTime,
    Boolean,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base

# --------------------------------------------------
# USERS
# --------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # customer | provider | admin

    customer = relationship("Customer", back_populates="user", uselist=False)
    provider = relationship("Provider", back_populates="user", uselist=False)
    admin = relationship("Admin", back_populates="user", uselist=False)


# --------------------------------------------------
# CUSTOMER
# --------------------------------------------------

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    user = relationship("User", back_populates="customer")
    requests = relationship("Request", back_populates="customer")


# --------------------------------------------------
# PROVIDER
# --------------------------------------------------

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Core provider fields used at signup
    service_type = Column(String, nullable=True)
    base_price = Column(Float, nullable=True)

    # Online / availability
    is_online = Column(Boolean, default=False)

    # Profile / details
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, nullable=True)
    city = Column(String, nullable=True)
    address_line = Column(String, nullable=True)

    # Working hours / schedule
    working_days = Column(String, nullable=True)  # CSV string
    start_time = Column(String, nullable=True)    # "09:00"
    end_time = Column(String, nullable=True)      # "20:00"

    # Live location (also used by ensure_columns on Postgres)
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)

    # Stats
    rating = Column(Float, nullable=True)
    jobs_completed = Column(Integer, nullable=True)

    # KYC
    kyc_status = Column(String, default="not_submitted", nullable=False)

    user = relationship("User", back_populates="provider")
    requests = relationship("Request", back_populates="provider")
    location = relationship("ProviderLocation", back_populates="provider", uselist=False)
    kyc = relationship("ProviderKYC", back_populates="provider", uselist=False)

# --------------------------------------------------
# ADMIN
# --------------------------------------------------

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    user = relationship("User", back_populates="admin")


# --------------------------------------------------
# CUSTOMER REQUESTS
# --------------------------------------------------

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)

    title = Column(String, nullable=False)
    service_type = Column(String, nullable=False)
    budget = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    # Customer location
    customer_lat = Column(Float, nullable=True)
    customer_lng = Column(Float, nullable=True)

    status = Column(String, default="pending")

    customer = relationship("Customer", back_populates="requests")
    provider = relationship("Provider", back_populates="requests")


# --------------------------------------------------
# PROVIDER LIVE LOCATION (GPS)
# --------------------------------------------------

class ProviderLocation(Base):
    __tablename__ = "provider_locations"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), unique=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_online = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    provider = relationship("Provider", back_populates="location")


# --------------------------------------------------
# PROVIDER KYC
# --------------------------------------------------

class ProviderKYC(Base):
    __tablename__ = "provider_kyc"

    id = Column(Integer, primary_key=True, index=True)

    provider_id = Column(
        Integer,
        ForeignKey("providers.id"),
        unique=True,
        nullable=False,
    )

    id_number = Column(String, nullable=False)
    address_line = Column(String, nullable=True)

    id_proof_url = Column(String, nullable=False)
    address_proof_url = Column(String, nullable=False)
    profile_photo_url = Column(String, nullable=True)

    status = Column(String, default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    # Link back to Provider
    provider = relationship("Provider", back_populates="kyc")
