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

from .database import Base


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

    service_type = Column(String, nullable=False)
    base_price = Column(Float, nullable=False)

    # dashboard / presence
    is_online = Column(Boolean, default=False)

    # not_submitted | pending | approved | rejected
    kyc_status = Column(String, default="not_submitted")

    user = relationship("User", back_populates="provider")
    location = relationship(
        "ProviderLocation", back_populates="provider", uselist=False
    )
    kyc = relationship("ProviderKYC", back_populates="provider", uselist=False)

    requests = relationship("Request", back_populates="provider")


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

    # ✅ ADD THESE
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
        Integer, ForeignKey("providers.id"), unique=True, nullable=False
    )

    id_number = Column(String, nullable=False)
    address_line = Column(String, nullable=True)

    id_proof_path = Column(String, nullable=False)
    address_proof_path = Column(String, nullable=False)
    profile_photo_path = Column(String, nullable=True)

    status = Column(String, default="pending")  # pending | approved | rejected

    provider = relationship("Provider", back_populates="kyc")
