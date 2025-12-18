from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from deps.auth import get_current_user
import models
from schemas import ProviderLocationIn

router = APIRouter(prefix="/providers", tags=["provider-presence"])


# -------------------------------------------------
# PROVIDER REQUIRED
# -------------------------------------------------
def provider_required(user=Depends(get_current_user)):
    if user["role"] != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    return user


# -------------------------------------------------
# POST /providers/location
# -------------------------------------------------
@router.post("/location")
def update_provider_location(
    payload: ProviderLocationIn,
    db: Session = Depends(get_db),
    token=Depends(provider_required),
):
    user_id = int(token["user_id"])

    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user_id)
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    location = (
        db.query(models.ProviderLocation)
        .filter(models.ProviderLocation.provider_id == provider.id)
        .first()
    )

    if location:
        location.latitude = payload.latitude
        location.longitude = payload.longitude
        location.updated_at = datetime.utcnow()
    else:
        db.add(
            models.ProviderLocation(
                provider_id=provider.id,
                latitude=payload.latitude,
                longitude=payload.longitude,
                updated_at=datetime.utcnow(),
            )
        )

    db.commit()
    return {"ok": True}
