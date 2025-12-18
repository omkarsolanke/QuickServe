from fastapi import APIRouter, HTTPException
from services.location_service import reverse_geocode

router = APIRouter(prefix="/location", tags=["location"])

@router.get("/reverse")
def reverse_location(lat: float, lng: float):
    result = reverse_geocode(lat, lng)
    if not result:
        raise HTTPException(status_code=400, detail="Unable to resolve location")

    return {
        "address": result.get("formatted"),
        "city": result.get("city"),
        "state": result.get("state"),
        "country": result.get("country"),
    }
