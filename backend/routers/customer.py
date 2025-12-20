from fastapi import APIRouter, Depends, HTTPException, status ,Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from deps.customer import customer_required
import models
from auth_utils import verify_password, get_password_hash

router = APIRouter(prefix="/customer", tags=["customer"])


# ---------- READ PROFILE ----------

@router.get("/me")
def get_customer_me(
    db: Session = Depends(get_db),
    user: dict = Depends(customer_required),
):
    user_id = int(user["user_id"])

    user_row = db.query(models.User).filter_by(id=user_id).first()
    customer = db.query(models.Customer).filter_by(user_id=user_id).first()

    if not user_row or not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {
        "user": {
            "id": user_row.id,
            "email": user_row.email,
            "full_name": user_row.full_name,
            "role": user_row.role,
        },
        "customer": {
            "id": customer.id,
        },
        "stats": {
            "active": 0,
            "completed": 0,
            "total": 0,
        },
    }


# ---------- UPDATE PROFILE ----------

class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


@router.patch("/me", status_code=status.HTTP_200_OK)
def update_customer_me(
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(customer_required),
):
    user_id = int(user["user_id"])

    user_row = db.query(models.User).filter_by(id=user_id).first()
    customer = db.query(models.Customer).filter_by(user_id=user_id).first()

    if not user_row or not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Update basic fields
    if payload.full_name is not None:
        user_row.full_name = payload.full_name.strip()

    if payload.email is not None:
        user_row.email = payload.email.lower().strip()

    # Optional password change
    if payload.new_password:
        if not payload.current_password:
            raise HTTPException(
                status_code=400,
                detail="Current password is required to change password",
            )

        if not verify_password(payload.current_password, user_row.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect",
            )

        user_row.hashed_password = get_password_hash(payload.new_password)

    db.commit()
    db.refresh(user_row)

    return {
        "user": {
            "id": user_row.id,
            "email": user_row.email,
            "full_name": user_row.full_name,
            "role": user_row.role,
        },
        "customer": {
            "id": customer.id,
        },
    }



# ---------- NEARBY PROVIDERS ----------

# Map smart-request chips to provider.service_type values
SERVICE_MAP = {
    "AC Repair": ["AC Repair"],
    "Electrical issue": ["Electrician"],
    "Plumbing leak": ["Plumber"],
    "Cleaning": ["Cleaner"],
    "Carpentry": ["Carpenter"],
    "Painting": ["Painter"],
    "Appliance repair": ["Appliance repair"],
}

@router.get("/nearby-providers")
def nearby_providers(
    service_type: str = Query(..., description="Service type from the smart request UI"),
    db: Session = Depends(get_db),
    user: dict = Depends(customer_required),
):
    """
    Returns approved, online providers that match the chosen service type.
    Uses SERVICE_MAP so all smart-request chips map to the correct provider.service_type.
    """

    # fallback: if no mapping, use the raw service_type
    allowed_types = SERVICE_MAP.get(service_type, [service_type])

    providers = (
        db.query(models.Provider, models.User)
        .join(models.User, models.User.id == models.Provider.user_id)
        .filter(models.Provider.service_type.in_(allowed_types))
        .filter(models.Provider.kyc_status == "approved")
        .filter(models.Provider.is_online == True)
        .all()
    )

    items = [
        {
            "provider_id": p.id,
            "full_name": u.full_name,
            "email": u.email,
            "service_type": p.service_type,
            "base_price": p.base_price,
            "kyc_status": p.kyc_status,
            "is_online": bool(p.is_online),
        }
        for p, u in providers
    ]

    return {"items": items}