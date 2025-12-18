import os
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

from database import get_db
import models, schemas
from deps.auth import get_current_user
from utils import cloudinary_config  # ensures config loads
import cloudinary.uploader

router = APIRouter(prefix="/provider/kyc", tags=["provider-kyc"])

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# =====================================================
# HELPERS
# =====================================================

def _validate_ext(file: UploadFile) -> str:
    ext = os.path.splitext((file.filename or "").lower())[1]
    if ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}",
        )
    return ext


async def _upload_to_cloudinary(file: UploadFile, folder: str) -> str:
    """
    Uploads an UploadFile to Cloudinary and returns secure_url.
    """
    ext = _validate_ext(file)
    bytes_data = await file.read()

    if not bytes_data:
        raise HTTPException(status_code=400, detail="Empty file upload")

    if len(bytes_data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    resource_type = "image" if ext != ".pdf" else "raw"

    result = cloudinary.uploader.upload(
        bytes_data,
        folder=folder,
        resource_type=resource_type,
        use_filename=True,
        unique_filename=True,
    )

    url = result.get("secure_url")
    if not url:
        raise HTTPException(
            status_code=500,
            detail="Cloudinary upload failed",
        )

    return url


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
        raise HTTPException(status_code=403, detail="Only providers allowed")

    provider = get_provider(db, int(token["user_id"]))

    return {"status": provider.kyc_status or "not_submitted"}


# =====================================================
# POST /provider/kyc/upload
# =====================================================

@router.post("/upload")
async def upload_kyc(
    id_number: str = Form(...),
    address_line: str = Form(""),
    id_proof: UploadFile = File(...),
    address_proof: UploadFile = File(...),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    token=Depends(get_current_user),
):
    if token.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Only providers allowed")

    provider = get_provider(db, int(token["user_id"]))

    base_folder = f"quickserve/kyc/provider_{provider.id}"

    id_proof_url = await _upload_to_cloudinary(
        id_proof, f"{base_folder}/id_proof"
    )
    address_proof_url = await _upload_to_cloudinary(
        address_proof, f"{base_folder}/address_proof"
    )

    profile_photo_url: Optional[str] = None
    if profile_photo:
        profile_photo_url = await _upload_to_cloudinary(
            profile_photo, f"{base_folder}/profile_photo"
        )

    existing = (
        db.query(models.ProviderKYC)
        .filter(models.ProviderKYC.provider_id == provider.id)
        .first()
    )

    if existing:
        existing.id_number = id_number
        existing.address_line = address_line
        existing.id_proof_path = id_proof_url
        existing.address_proof_path = address_proof_url
        existing.profile_photo_path = profile_photo_url
    else:
        db.add(
            models.ProviderKYC(
                provider_id=provider.id,
                id_number=id_number,
                address_line=address_line,
                id_proof_path=id_proof_url,
                address_proof_path=address_proof_url,
                profile_photo_path=profile_photo_url,
            )
        )

    provider.kyc_status = "pending"
    provider.is_online = False

    db.commit()

    return {
        "ok": True,
        "status": "pending",
    }
