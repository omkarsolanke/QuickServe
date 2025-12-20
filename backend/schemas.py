from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, field_validator, Field

RoleType = Literal["customer", "provider", "admin"]


class UserBase(BaseModel):
    full_name: str
    email: str
    role: RoleType


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)
    service_type: Optional[str] = None
    base_price: Optional[float] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str):
        # extra rules (if any) go here; length already enforced by Field
        return v


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: RoleType

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserUpdate(BaseModel):
    full_name: str
    email: EmailStr


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 72:
            raise ValueError("Password must be at most 72 characters")
        return v


class RequestCreate(BaseModel):
    title: str
    service_type: str
    budget: Optional[float] = None
    address: Optional[str] = None
    description: Optional[str] = None


class RequestOut(BaseModel):
    id: int
    title: str
    service_type: str
    budget: Optional[float]
    address: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    status: str

    class Config:
        from_attributes = True


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    is_online: bool = True


class ProviderNearbyOut(BaseModel):
    provider_id: int
    full_name: str
    service_type: str
    base_price: float
    latitude: float
    longitude: float
    distance_km: float


class ProviderKycStatusOut(BaseModel):
    status: str


class ProviderOnlineIn(BaseModel):
    is_online: bool


# --------------------------------------------------
# ADMIN SCHEMAS
# --------------------------------------------------

class AdminStatsOut(BaseModel):
    pending_kyc: int = 0
    total_providers: int = 0
    online_providers: int = 0
    total_customers: int = 0
    total_requests: int = 0
    open_reports: int = 0


class KycRejectIn(BaseModel):
    reason: str
