from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from sqlalchemy import or_

from database import get_db
import models
from dependencies.admin_required import admin_required
from utils.settings_store import load_settings, save_settings
from schemas import AdminStatsOut, KycRejectIn


router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(admin_required)],
)

# ======================================================
# DASHBOARD STATS
# ======================================================
@router.get("/stats", response_model=AdminStatsOut)
def admin_stats(db: Session = Depends(get_db)):
    return {
        "pending_kyc": db.query(models.Provider)
        .filter(models.Provider.kyc_status == "pending")
        .count(),
        "total_providers": db.query(models.Provider).count(),
        "online_providers": db.query(models.Provider)
        .filter(models.Provider.is_online == True)
        .count(),
        "total_customers": db.query(models.User)
        .filter(models.User.role == "customer")
        .count(),
        "total_requests": db.query(models.Request).count(),
        "open_reports": 0,
    }

# ======================================================
# KYC QUEUE
# ======================================================
@router.get("/kyc")
def kyc_queue(
    status: str = Query("pending"),
    search: str = "",
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.Provider, models.User)
        .join(models.User, models.User.id == models.Provider.user_id)
        .filter(models.Provider.kyc_status == status)
    )

    if search:
        q = q.filter(
            or_(
                models.User.full_name.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%"),
            )
        )

    total = q.count()
    rows = q.offset(offset).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "provider_id": p.id,
                "name": u.full_name,
                "email": u.email,
                "service_type": p.service_type,
                "kyc_status": p.kyc_status,
                "is_online": bool(p.is_online),
            }
            for p, u in rows
        ],
    }

# ======================================================
# KYC DETAIL  (matches AdminKycReview.jsx)
# ======================================================
@router.get("/kyc/{provider_id}")
def kyc_detail(provider_id: int, db: Session = Depends(get_db)):
    # Provider + user
    row = (
        db.query(models.Provider, models.User)
        .join(models.User, models.User.id == models.Provider.user_id)
        .filter(models.Provider.id == provider_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider, user = row

    # Optional: separate ProviderKYC table; adjust name/fields to your model
    kyc = (
        db.query(models.ProviderKYC)
        .filter(models.ProviderKYC.provider_id == provider_id)
        .first()
    )

    if not kyc:
        # still return basic structure so frontend doesn't crash
        return {
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
            },
            "provider": {
                "id": provider.id,
                "user_id": provider.user_id,
                "service_type": provider.service_type,
                "base_price": provider.base_price,
                "kyc_status": provider.kyc_status,
                "is_online": bool(provider.is_online),
            },
            "kyc": {
                "id_proof_path": None,
                "address_proof_path": None,
                "profile_photo_path": None,
                "rejection_reason": None,
            },
        }

    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
        },
        "provider": {
            "id": provider.id,
            "user_id": provider.user_id,
            "service_type": provider.service_type,
            "base_price": provider.base_price,
            "kyc_status": provider.kyc_status,
            "is_online": bool(provider.is_online),
        },
        "kyc": {
            "id": kyc.id,
            "id_proof_path": kyc.id_proof_path,
            "address_proof_path": kyc.address_proof_path,
            "profile_photo_path": kyc.profile_photo_path,
            "rejection_reason": getattr(kyc, "rejection_reason", None),
        },
    }

# ======================================================
# KYC APPROVE / REJECT
# ======================================================
@router.post("/kyc/{provider_id}/approve")
def kyc_approve(provider_id: int, db: Session = Depends(get_db)):
    provider = (
        db.query(models.Provider)
        .filter(models.Provider.id == provider_id)
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider.kyc_status = "approved"
    # if you track rejection_reason on KYC, clear it
    kyc = (
        db.query(models.ProviderKYC)
        .filter(models.ProviderKYC.provider_id == provider_id)
        .first()
    )
    if kyc and hasattr(kyc, "rejection_reason"):
        kyc.rejection_reason = None

    db.commit()
    return {"message": "KYC approved", "kyc_status": provider.kyc_status}


@router.post("/kyc/{provider_id}/reject")
def kyc_reject(
    provider_id: int,
    payload: KycRejectIn,
    db: Session = Depends(get_db),
):
    provider = (
        db.query(models.Provider)
        .filter(models.Provider.id == provider_id)
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider.kyc_status = "rejected"

    kyc = (
        db.query(models.ProviderKYC)
        .filter(models.ProviderKYC.provider_id == provider_id)
        .first()
    )
    if kyc and hasattr(kyc, "rejection_reason"):
        kyc.rejection_reason = payload.reason

    db.commit()
    return {"message": "KYC rejected", "kyc_status": provider.kyc_status}

# ======================================================
# PROVIDERS
# ======================================================
@router.get("/providers")
def admin_providers(
    search: str = "",
    service_type: str = "",
    kyc_status: str = "",
    is_online: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.Provider, models.User)
        .join(models.User, models.User.id == models.Provider.user_id)
    )

    if search:
        q = q.filter(
            or_(
                models.User.full_name.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%"),
            )
        )

    if service_type:
        q = q.filter(models.Provider.service_type == service_type)

    if kyc_status:
        q = q.filter(models.Provider.kyc_status == kyc_status)

    if is_online is not None:
        q = q.filter(models.Provider.is_online == is_online)

    rows = q.all()

    return {
        "items": [
            {
                "provider_id": p.id,
                "user_id": u.id,
                "name": u.full_name,
                "email": u.email,
                "service_type": p.service_type,
                "base_price": p.base_price,
                "kyc_status": p.kyc_status,
                "is_online": bool(p.is_online),
            }
            for p, u in rows
        ]
    }

# ======================================================
# CUSTOMERS
# ======================================================
@router.get("/customers")
def admin_customers(
    search: str = "",
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(models.User).filter(models.User.role == "customer")

    if search:
        q = q.filter(
            or_(
                models.User.full_name.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%"),
            )
        )

    total = q.count()
    users = q.offset(offset).limit(limit).all()

    return {
        "total": total,
        "items": [{"id": u.id, "name": u.full_name, "email": u.email} for u in users],
    }

# ======================================================
# REQUESTS
# ======================================================

@router.get("/requests")
def admin_requests(
    status: str = Query("", description="Filter by request status"),
    service_type: str = Query("", description="Filter by service type"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: dict = Depends(admin_required),
):
    """
    List service requests for admin, including customer location and provider info.
    """
    q = (
        db.query(models.Request)
        .options(
            joinedload(models.Request.provider).joinedload(models.Provider.user)
        )
        .order_by(models.Request.id.desc())
    )

    if status:
        q = q.filter(models.Request.status == status)

    if service_type:
        q = q.filter(models.Request.service_type == service_type)

    total = q.count()
    rows = q.offset(offset).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id": r.id,
                "title": r.title,
                "service_type": r.service_type,
                "status": r.status,

                # ✅ CUSTOMER INFO
                "customer_id": getattr(r.customer.user, "full_name", None),
                "address": r.address,

                # ✅ PROVIDER INFO (IF ASSIGNED)
                "provider": (
                    {
                        "id": r.provider.id,
                        "name": (
                            getattr(r.provider.user, "full_name", None)
                            if getattr(r.provider, "user", None)
                            else None
                        ),
                        "phone": (
                            getattr(r.provider.user, "phone", None)
                            if getattr(r.provider, "user", None)
                            else None
                        ),
                    }
                    if r.provider
                    else None
                ),
            }
            for r in rows
        ],
    }



# ======================================================
# REPORTS (placeholder)
# ======================================================
@router.get("/reports")
def admin_reports(
    status: str = "",
    search: str = "",
    limit: int = 100,
    offset: int = 0,
):
    return {"total": 0, "items": []}

# ======================================================
# SETTINGS
# ======================================================
@router.get("/settings")
def get_settings():
    return load_settings() or {}

@router.put("/settings")
def update_settings(payload: dict):
    return save_settings(payload)
