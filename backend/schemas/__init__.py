from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, field_validator

RoleType = Literal["customer", "provider", "admin"]

# ---------------- USERS ----------------
from .provider_location import ProviderLocationIn, ProviderLocationOut

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: RoleType


class UserCreate(UserBase):
    password: str
    service_type: Optional[str] = None
    base_price: Optional[float] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[RoleType] = None


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: RoleType

    model_config = {
        "from_attributes": True
    }

# ---------------- AUTH ----------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

# ---------------- REQUESTS ----------------

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

    model_config = {
        "from_attributes": True
    }

# ---------------- PROVIDERS ----------------

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

# ---------------- ADMIN ----------------

class AdminStatsOut(BaseModel):
    pending_kyc: int = 0
    total_providers: int = 0
    online_providers: int = 0
    total_customers: int = 0
    total_requests: int = 0
    open_reports: int = 0


class KycRejectIn(BaseModel):
    reason: str
