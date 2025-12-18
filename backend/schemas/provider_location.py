from typing import Optional
from pydantic import BaseModel, Field


class ProviderLocationIn(BaseModel):
    latitude: float = Field(..., example=18.5204)
    longitude: float = Field(..., example=73.8567)


class ProviderLocationOut(BaseModel):
    latitude: float
    longitude: float
    updated_at: Optional[str] = None
