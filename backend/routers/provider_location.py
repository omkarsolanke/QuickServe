from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from deps.auth import get_current_user
import models
from services.location_service import reverse_geocode

router = APIRouter(prefix="/provider", tags=["provider-location"])


@router.post("/providers/location")
def update_provider_location(
    payload: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")

    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user["user_id"])
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    lat = payload.get("latitude")
    lng = payload.get("longitude")

    provider.last_latitude = lat
    provider.last_longitude = lng

    # Auto-detect city using OpenCage
    geo = reverse_geocode(lat, lng)
    if geo and geo.get("city"):
        provider.city = geo["city"]

    if "is_online" in payload:
        provider.is_online = bool(payload.get("is_online"))

    db.commit()
    return {"ok": True}
