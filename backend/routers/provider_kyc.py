# backend/routers/provider_kyc.py
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
import models, schemas
from deps.auth import get_current_user
from utils.supabase_client import supabase

router = APIRouter(prefix="/provider/kyc", tags=["provider-kyc"])


def get_provider(db: Session, user_id: int) -> models.Provider:
    provider = (
        db.query(models.Provider)
        .filter(models.Provider.user_id == user_id)
        .first()
    )
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    return provider


def upload_file_to_supabase(file: UploadFile, folder: str) -> str:
    ext = (file.filename or "").split(".")[-1].lower()
    filename = f"{folder}/{file.filename}"
    content = file.file.read()
    supabase.storage.from_("kyc").upload(
        filename,
        content,
        {"content-type": file.content_type},
    )
    return supabase.storage.from_("kyc").get_public_url(filename)


@router.get("/status", response_model=schemas.ProviderKycStatusOut)
def kyc_status(
    db: Session = Depends(get_db),
    token=Depends(get_current_user),
):
    if token.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Only providers allowed")

    provider = get_provider(db, int(token["user_id"]))
    return {"status": provider.kyc_status or "not_submitted"}


@router.post("/upload")
async def upload_kyc(
    id_number: str = Form(...),
    address_line: Optional[str] = Form(None),
    id_proof: UploadFile = File(...),
    address_proof: Optional[UploadFile] = File(None),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    token=Depends(get_current_user),
):
    if token.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Only providers allowed")

    provider = get_provider(db, int(token["user_id"]))

    base_folder = f"quickserve/kyc/provider_{provider.id}"

    id_proof_url = upload_file_to_supabase(id_proof, f"{base_folder}/id_proof")

    address_proof_url = None
    if address_proof is not None:
        address_proof_url = upload_file_to_supabase(
            address_proof, f"{base_folder}/address_proof"
        )

    profile_photo_url = None
    if profile_photo is not None:
        profile_photo_url = upload_file_to_supabase(
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
        existing.id_proof_url = id_proof_url
        existing.address_proof_url = address_proof_url
        existing.profile_photo_url = profile_photo_url
        existing.status = "pending"
    else:
        db.add(
            models.ProviderKYC(
                provider_id=provider.id,
                id_number=id_number,
                address_line=address_line,
                id_proof_url=id_proof_url,
                address_proof_url=address_proof_url,
                profile_photo_url=profile_photo_url,
                status="pending",
            )
        )

    provider.kyc_status = "pending"
    provider.is_online = False

    db.commit()

    return {"ok": True, "status": "pending"}
