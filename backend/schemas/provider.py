from pydantic import BaseModel, Field
from typing import List, Optional


class ProviderUserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    role: str


class ProviderOut(BaseModel):
    id: int
    user_id: int
    service_type: Optional[str]
    base_price: int = 0
    is_online: bool = False
    kyc_status: Optional[str]

    bio: Optional[str]
    experience_years: int = 0
    city: Optional[str]
    address_line: Optional[str]

    working_days: List[str] = []
    start_time: str = "09:00"
    end_time: str = "20:00"


class ProviderMeOut(BaseModel):
    user: ProviderUserOut
    provider: ProviderOut


class ProviderUserUpdateIn(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class ProviderUpdateIn(BaseModel):
    bio: Optional[str] = None
    service_type: Optional[str] = None
    base_price: Optional[int] = Field(default=None, ge=0)
    experience_years: Optional[int] = Field(default=None, ge=0)
    city: Optional[str] = None
    address_line: Optional[str] = None


class ProviderMeUpdateIn(BaseModel):
    user: ProviderUserUpdateIn
    provider: ProviderUpdateIn


class AvailabilityIn(BaseModel):
    is_online: bool
    working_days: List[str] = []
    start_time: str = "09:00"
    end_time: str = "20:00"
