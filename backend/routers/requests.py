import base64
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Query,
)
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from deps.customer import customer_required
from deps.auth import get_current_user
import models
from services.location_service import reverse_geocode
from services.cloudinary_service import upload_temp_image
from services.groq_vision import analyze_service_image
import logging

# =====================================================
# SCHEMAS
# =====================================================

class RequestCreateIn(BaseModel):
    title: str = Field(..., min_length=1)
    service_type: str = Field(..., min_length=1)
    address: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    customer_lat: Optional[float] = None
    customer_lng: Optional[float] = None


# =====================================================
# ROUTERS
# =====================================================

requests_router = APIRouter(prefix="/requests", tags=["requests"])
ai_router = APIRouter(prefix="/ai", tags=["ai"])

logger = logging.getLogger("quickserve.ai")

# =====================================================
# CREATE REQUEST
# =====================================================

@requests_router.post("")
def create_request(
    payload: RequestCreateIn,
    db: Session = Depends(get_db),
    user: dict = Depends(customer_required),
):
    # Ensure columns safely
    

    customer = (
        db.query(models.Customer)
        .filter(models.Customer.user_id == user["user_id"])
        .first()
    )
    if not customer:
        raise HTTPException(status_code=400, detail="Customer profile not found")

    address = payload.address

    if payload.customer_lat is not None and payload.customer_lng is not None and not address:
        geo = reverse_geocode(payload.customer_lat, payload.customer_lng)
        if geo:
            address = geo.get("formatted")

    req = models.Request(
        customer_id=customer.id,
        title=payload.title,
        service_type=payload.service_type,
        address=address,
        description=payload.description,
        budget=payload.budget,
        customer_lat=payload.customer_lat,
        customer_lng=payload.customer_lng,
        status="pending",
    )

    db.add(req)
    db.commit()
    db.refresh(req)

    return {
        "id": req.id,
        "title": req.title,
        "service_type": req.service_type,
        "status": req.status,
        "address": req.address,
        "customer_lat": req.customer_lat,
        "customer_lng": req.customer_lng,
        "budget": req.budget,
    }


# =====================================================
# MY REQUESTS
# =====================================================

@requests_router.get("/my")
def my_requests(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: dict = Depends(customer_required),
):
    customer = (
        db.query(models.Customer)
        .filter(models.Customer.user_id == user["user_id"])
        .first()
    )
    if not customer:
        raise HTTPException(status_code=400, detail="Customer profile not found")

    rows = (
        db.query(models.Request)
        .filter(models.Request.customer_id == customer.id)
        .order_by(models.Request.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": r.id,
            "title": r.title,
            "service_type": r.service_type,
            "status": r.status,
            "budget": getattr(r, "budget", None),
            "address": getattr(r, "address", None),
            "description": getattr(r, "description", None),
            "provider_id": getattr(r, "provider_id", None),
        }
        for r in rows
    ]


# =====================================================
# ASSIGN PROVIDER
# =====================================================

@requests_router.post("/{request_id}/assign-provider")
def assign_provider(
    request_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Customer access only")

    customer = (
        db.query(models.Customer)
        .filter(models.Customer.user_id == user["user_id"])
        .first()
    )
    if not customer:
        raise HTTPException(status_code=400, detail="Customer profile not found")

    r = (
        db.query(models.Request)
        .filter(
            models.Request.id == request_id,
            models.Request.customer_id == customer.id,
        )
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")

    if str(getattr(r, "status", "")).lower() != "pending":
        raise HTTPException(
            status_code=400,
            detail="Request not pending anymore",
        )

    provider_id = payload.get("provider_id")
    if not provider_id:
        raise HTTPException(status_code=400, detail="provider_id is required")

    provider = db.query(models.Provider).filter_by(id=provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    r.provider_id = provider.id

    if hasattr(provider, "base_price"):
        r.budget = provider.base_price

    db.commit()
    db.refresh(r)

    return {
        "id": r.id,
        "status": r.status,
        "provider_id": r.provider_id,
        "budget": getattr(r, "budget", None),
    }


# =====================================================
# CANCEL REQUEST
# =====================================================

@requests_router.post("/{request_id}/cancel")
def cancel_request(
    request_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(customer_required),
):
    customer = (
        db.query(models.Customer)
        .filter(models.Customer.user_id == user["user_id"])
        .first()
    )
    if not customer:
        raise HTTPException(status_code=400, detail="Customer profile not found")

    req = (
        db.query(models.Request)
        .filter(
            models.Request.id == request_id,
            models.Request.customer_id == customer.id,
        )
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if str(req.status).lower() != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be cancelled",
        )

    req.status = "cancelled"
    db.commit()
    db.refresh(req)

    return {
        "id": req.id,
        "status": req.status,
    }


# =====================================================
# GET SINGLE REQUEST
# =====================================================

@requests_router.get("/{request_id}")
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(customer_required),
):
    customer = (
        db.query(models.Customer)
        .filter(models.Customer.user_id == user["user_id"])
        .first()
    )
    if not customer:
        raise HTTPException(statuscode=400, detail="Customer profile not found")

    r = (
        db.query(models.Request)
        .filter(
            models.Request.id == request_id,
            models.Request.customer_id == customer.id,
        )
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")

    return {
        "id": r.id,
        "title": r.title,
        "service_type": r.service_type,
        "status": r.status,
        "budget": getattr(r, "budget", None),
        "address": getattr(r, "address", None),
        "description": getattr(r, "description", None),
        "provider_id": getattr(r, "provider_id", None),
    }


# =====================================================
# AI ROUTER
# =====================================================

@ai_router.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    """
    Uploads the received image to Cloudinary and runs Groq vision to
    infer the service type. Returns a stable JSON payload.
    """
    image_bytes = await image.read()
    logger.info("Received image: %s (%d bytes)", image.filename, len(image_bytes))

    try:
        image_url = upload_temp_image(image_bytes)
        logger.info("Cloudinary URL: %s", image_url)
        result = analyze_service_image(image_url)
        logger.info("Groq result: %s", result)
    except Exception as exc:
        logger.exception("AI image analysis failed")
        raise HTTPException(
            status_code=500,
            detail=f"AI image analysis failed: {exc}",
        )

    return {
        "suggested_service": result.get("service", "Appliance repair"),
        "suggested_title": "Service request",
        "suggested_description": result.get("description", ""),
        "ai_provider": "groq",
    }
