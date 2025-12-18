from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db
from deps.auth import get_current_user
from deps.customer import customer_required
import models
from schemas.provider import ProviderMeOut, ProviderMeUpdateIn, AvailabilityIn

# -------------------------------------------------
# PROVIDER ROUTER
# -------------------------------------------------
provider_router = APIRouter(prefix="/provider", tags=["provider"])


# =====================================================
# AUTH DEPENDENCY
# =====================================================
def provider_required(user=Depends(get_current_user)):
    if user.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    return user


# =====================================================
# UTILS
# =====================================================
def csv_to_list(s):
    if not s:
        return []
    return [x.strip() for x in s.split(",") if x.strip()]


def list_to_csv(arr):
    if not arr:
        return ""
    return ",".join(arr)


def ensure_columns(db: Session):
    """
    Safe column creation for SQLite (DEV only).
    Prevents crashes if columns are missing.
    """
    provider_cols = {
        "bio": "TEXT",
        "experience_years": "INTEGER",
        "city": "TEXT",
        "address_line": "TEXT",
        "working_days": "TEXT",
        "start_time": "TEXT",
        "end_time": "TEXT",
        # live location stored on Provider
        "last_latitude": "REAL",
        "last_longitude": "REAL",
    }

    user_cols = {
        "phone": "TEXT",
    }

    def existing_cols(table):
        rows = db.execute(text(f"PRAGMA table_info({table})")).fetchall()
        return {r[1] for r in rows}

    provider_existing = existing_cols("providers")
    user_existing = existing_cols("users")

    for col, typ in provider_cols.items():
        if col not in provider_existing:
            db.execute(text(f"ALTER TABLE providers ADD COLUMN {col} {typ}"))

    for col, typ in user_cols.items():
        if col not in user_existing:
            db.execute(text(f"ALTER TABLE users ADD COLUMN {col} {typ}"))

    db.commit()


# =====================================================
# GET /provider/me
# =====================================================
@provider_router.get("/me", response_model=ProviderMeOut)
def get_me(db: Session = Depends(get_db), token=Depends(provider_required)):
    ensure_columns(db)

    user_id = int(token["user_id"])
    user = db.query(models.User).filter_by(id=user_id).first()
    provider = db.query(models.Provider).filter_by(user_id=user_id).first()

    if not user or not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": getattr(user, "phone", None),
            "role": user.role,
        },
        "provider": {
            "id": provider.id,
            "user_id": provider.user_id,
            "service_type": provider.service_type,
            "base_price": provider.base_price,
            "is_online": bool(provider.is_online),
            "kyc_status": provider.kyc_status or "not_submitted",
            "bio": getattr(provider, "bio", None),
            "experience_years": getattr(provider, "experience_years", 0) or 0,
            "city": getattr(provider, "city", None),
            "address_line": getattr(provider, "address_line", None),
            "working_days": csv_to_list(getattr(provider, "working_days", None)),
            "start_time": getattr(provider, "start_time", "09:00") or "09:00",
            "end_time": getattr(provider, "end_time", "20:00") or "20:00",
        },
    }


# =====================================================
# PUT /provider/me
# =====================================================
@provider_router.put("/me")
def update_me(
    payload: ProviderMeUpdateIn,
    db: Session = Depends(get_db),
    token=Depends(provider_required),
):
    ensure_columns(db)

    user_id = int(token["user_id"])
    user = db.query(models.User).filter_by(id=user_id).first()
    provider = db.query(models.Provider).filter_by(user_id=user_id).first()

    if not user or not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    if payload.user.full_name is not None:
        user.full_name = payload.user.full_name
    if payload.user.phone is not None:
        user.phone = payload.user.phone

    p = payload.provider
    for field in (
        "bio",
        "service_type",
        "base_price",
        "experience_years",
        "city",
        "address_line",
    ):
        value = getattr(p, field, None)
        if value is not None:
            setattr(provider, field, value)

    db.commit()
    return {"ok": True}


# =====================================================
# PUT /provider/me/availability
# =====================================================
@provider_router.put("/me/availability")
def update_availability(
    payload: AvailabilityIn,
    db: Session = Depends(get_db),
    token=Depends(provider_required),
):
    ensure_columns(db)

    user_id = int(token["user_id"])
    provider = db.query(models.Provider).filter_by(user_id=user_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    if payload.is_online and provider.kyc_status != "approved":
        raise HTTPException(status_code=400, detail="KYC not approved")

    provider.is_online = payload.is_online
    provider.working_days = list_to_csv(payload.working_days)
    provider.start_time = payload.start_time
    provider.end_time = payload.end_time

    db.commit()
    return {"ok": True, "is_online": bool(provider.is_online)}


# =====================================================
# POST /provider/providers/location  (frontend calls /providers/location)
# =====================================================
@provider_router.post("/providers/location")
def update_location(
    payload: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    ensure_columns(db)

    if user.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")

    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user["user_id"])
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider.last_latitude = payload.get("latitude")
    provider.last_longitude = payload.get("longitude")

    if "is_online" in payload:
        provider.is_online = bool(payload.get("is_online"))

    db.commit()
    return {"ok": True}


# =====================================================
# GET /provider/providers/location/me
# =====================================================
@provider_router.get("/providers/location/me")
def provider_location_me(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    ensure_columns(db)

    if user.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")

    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user["user_id"])
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    return {
        "latitude": getattr(provider, "last_latitude", None),
        "longitude": getattr(provider, "last_longitude", None),
    }



# =====================================================
# GET /provider/incoming
# =====================================================
@provider_router.get("/incoming")
def incoming_requests(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    if user.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")

    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user["user_id"])
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    active_statuses = ["assigned", "en_route", "arrived", "payment"]
    active = (
        db.query(models.Request)
        .filter(
            models.Request.provider_id == provider.id,
            models.Request.status.in_(active_statuses),
        )
        .first()
    )
    if active:
        return []

    rows = (
        db.query(models.Request)
        .filter(
            models.Request.provider_id == provider.id,
            models.Request.status == "pending",
        )
        .order_by(models.Request.id.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": r.id,
            "title": r.title,
            "service_type": r.service_type,
            "status": r.status,
            "budget": getattr(r, "budget", None),
        }
        for r in rows
    ]


# =====================================================
# GET /provider/history
# =====================================================
@provider_router.get("/history")
def provider_history(
    limit: int = Query(20, ge=1, le=100),
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

    rows = (
        db.query(models.Request)
        .filter(models.Request.provider_id == provider.id)
        .order_by(models.Request.id.desc())
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
        }
        for r in rows
    ]


# =====================================================
# GET /provider/current-job
# =====================================================
@provider_router.get("/current-job")
def current_job(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    if user.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")

    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user["user_id"])
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    active_statuses = ["assigned", "en_route", "arrived", "payment"]
    r = (
        db.query(models.Request)
        .filter(
            models.Request.provider_id == provider.id,
            models.Request.status.in_(active_statuses),
        )
        .order_by(models.Request.id.desc())
        .first()
    )

    if not r:
        return None

    return {
        "id": r.id,
        "title": r.title,
        "service_type": r.service_type,
        "status": r.status,
        "budget": getattr(r, "budget", None),
        "address": getattr(r, "address", None),
        "description": getattr(r, "description", None),
        "customer_lat": getattr(r, "customer_lat", None),
        "customer_lng": getattr(r, "customer_lng", None),
    }


def _get_current_provider(db: Session, user: dict) -> models.Provider:
    if user.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user["user_id"])
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


# =====================================================
# GET /provider/requests/{id}
# =====================================================
@provider_router.get("/requests/{request_id}")
def provider_request_detail(
    request_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    provider = _get_current_provider(db, user)

    r = (
        db.query(models.Request)
        .filter(
            models.Request.id == request_id,
            models.Request.provider_id == provider.id,
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
        "customer_lat": getattr(r, "customer_lat", None),
        "customer_lng": getattr(r, "customer_lng", None),
        "address": getattr(r, "address", None),
        "description": getattr(r, "description", None),
    }


# =====================================================
# POST /provider/requests/{id}/accept
# =====================================================
@provider_router.post("/requests/{request_id}/accept")
def provider_accept_request(
    request_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    provider = _get_current_provider(db, user)

    r = (
        db.query(models.Request)
        .filter(
            models.Request.id == request_id,
            models.Request.provider_id == provider.id,
        )
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    if r.status != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")

    r.status = "assigned"
    db.commit()
    db.refresh(r)
    return {"id": r.id, "status": r.status}


# =====================================================
# POST /provider/requests/{id}/reject
# =====================================================
@provider_router.post("/requests/{request_id}/reject")
def provider_reject_request(
    request_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    provider = _get_current_provider(db, user)

    r = (
        db.query(models.Request)
        .filter(
            models.Request.id == request_id,
            models.Request.provider_id == provider.id,
        )
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    if r.status != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")

    r.status = "cancelled"
    db.commit()
    db.refresh(r)
    return {"id": r.id, "status": r.status}


# =====================================================
# POST /provider/requests/{id}/status
# =====================================================
@provider_router.post("/requests/{request_id}/status")
def provider_update_status(
    request_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    provider = _get_current_provider(db, user)

    r = (
        db.query(models.Request)
        .filter(
            models.Request.id == request_id,
            models.Request.provider_id == provider.id,
        )
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")

    new_status = payload.get("status")
    allowed = {"assigned", "en_route", "arrived", "payment", "completed"}
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")
    if r.status == "completed":
        raise HTTPException(status_code=400, detail="Job already completed")

    r.status = new_status
    db.commit()
    db.refresh(r)
    return {"id": r.id, "status": r.status}



# -------------------------------------------------
# CUSTOMER ROUTER: /customer/nearby-providers
# -------------------------------------------------
customer_router = APIRouter(prefix="/customer", tags=["customer-providers"])


@customer_router.get("/nearby-providers")
def nearby_providers(
    service_type: str = "",
    limit: int = Query(20, ge=1, le=50),
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

    q = (
        db.query(models.Provider, models.User)
        .join(models.User, models.User.id == models.Provider.user_id)
        .filter(models.Provider.is_online == True)
    )
    if service_type:
        q = q.filter(models.Provider.service_type == service_type)

    rows = q.limit(200).all()
    active_statuses = ["assigned", "en_route", "arrived", "payment"]

    items = []
    for p, u in rows:
        has_active = (
            db.query(models.Request)
            .filter(
                models.Request.provider_id == p.id,
                models.Request.status.in_(active_statuses),
            )
            .first()
        )
        if has_active:
            continue

        items.append(
            {
                "provider_id": p.id,
                "name": u.full_name,
                "area": getattr(p, "city", "") or "Mumbai",
                "distance_km": None,
                "est_min": getattr(p, "base_price", 0) or 0,
                "est_max": (getattr(p, "base_price", 0) or 0) + 500,
                "rating": getattr(p, "rating", 4.5),
                "jobs": getattr(p, "jobs_completed", 0),
            }
        )
        if len(items) >= limit:
            break

    return {"items": items}




# =====================================================
# PUBLIC PROVIDER PROFILE (for customers)
# GET /providers/{provider_id}
# =====================================================

public_provider_router = APIRouter(prefix="/providers", tags=["providers-public"])


@public_provider_router.get("/{provider_id}")
def get_provider_public_profile(
    provider_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(customer_required),
):
    """
    Public provider profile for customer views
    (Confirm booking, provider details, etc.)
    """

    row = (
        db.query(models.Provider, models.User)
        .join(models.User, models.User.id == models.Provider.user_id)
        .filter(models.Provider.id == provider_id)
        .first()
    )

    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider, user_row = row

    return {
        "id": provider.id,
        "name": user_row.full_name,
        "service_type": provider.service_type,
        "city": getattr(provider, "city", "Mumbai"),
        "base_price": provider.base_price,
        "rating": getattr(provider, "rating", 4.5),
        "jobs_completed": getattr(provider, "jobs_completed", 0),
        "is_online": bool(provider.is_online),
    }
