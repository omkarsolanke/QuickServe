import os
import uuid
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
    HTTPException,
)
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.deps.auth import get_current_user   # ✅ FIXED IMPORT

router = APIRouter(prefix="/provider/kyc", tags=["provider-kyc"])

UPLOAD_DIR = "uploads/kyc"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".pdf"}


# =====================================================
# HELPERS
# =====================================================
def save_upload(file: UploadFile) -> str:
    ext = os.path.splitext((file.filename or "").lower())[1]
    if ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}",
        )

    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(file.file.read())

    return path


def get_provider(db: Session, user_id: int) -> models.Provider:
    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user_id)
        .first()
    )
    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider profile not found",
        )
    return provider


# =====================================================
# GET /provider/kyc/status
# =====================================================
@router.get("/status", response_model=schemas.ProviderKycStatusOut)
def kyc_status(
    db: Session = Depends(get_db),
    token=Depends(get_current_user),
):
    if token.get("role") != "provider":
        raise HTTPException(
            status_code=403,
            detail="Only providers allowed",
        )

    provider = get_provider(db, int(token["user_id"]))

    return {
        "status": provider.kyc_status or "not_submitted"
    }


# =====================================================
# POST /provider/kyc/upload
# =====================================================
@router.post("/upload")
def upload_kyc(
    id_number: str = Form(...),
    address_line: str = Form(""),
    id_proof: UploadFile = File(...),
    address_proof: UploadFile = File(...),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    token=Depends(get_current_user),
):
    if token.get("role") != "provider":
        raise HTTPException(
            status_code=403,
            detail="Only providers allowed",
        )

    provider = get_provider(db, int(token["user_id"]))

    id_proof_path = save_upload(id_proof)
    address_proof_path = save_upload(address_proof)
    profile_photo_path = (
        save_upload(profile_photo) if profile_photo else None
    )

    existing = (
        db.query(models.ProviderKYC)
        .filter(models.ProviderKYC.provider_id == provider.id)
        .first()
    )

    if existing:
        existing.id_number = id_number
        existing.address_line = address_line
        existing.id_proof_path = id_proof_path
        existing.address_proof_path = address_proof_path
        existing.profile_photo_path = profile_photo_path
    else:
        db.add(
            models.ProviderKYC(
                provider_id=provider.id,
                id_number=id_number,
                address_line=address_line,
                id_proof_path=id_proof_path,
                address_proof_path=address_proof_path,
                profile_photo_path=profile_photo_path,
            )
        )

    provider.kyc_status = "pending"
    provider.is_online = False

    db.commit()

    return {
        "ok": True,
        "status": "pending",
    }
