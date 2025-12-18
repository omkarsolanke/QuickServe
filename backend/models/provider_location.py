from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from datetime import datetime
from backend.database import Base


class ProviderLocation(Base):
    __tablename__ = "provider_locations"

    id = Column(Integer, primary_key=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
