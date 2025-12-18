# backend/utils/cloudinary_config.py

import os
import cloudinary

print("CLOUDINARY_CLOUD_NAME =", os.getenv("CLOUDINARY_CLOUD_NAME"))
print("CLOUDINARY_API_KEY   =", os.getenv("CLOUDINARY_API_KEY"))
print("CLOUDINARY_API_SECRET length =", len(os.getenv("CLOUDINARY_API_SECRET") or ""))

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

missing = []
if not CLOUDINARY_CLOUD_NAME:
    missing.append("CLOUDINARY_CLOUD_NAME")
if not CLOUDINARY_API_KEY:
    missing.append("CLOUDINARY_API_KEY")
if not CLOUDINARY_API_SECRET:
    missing.append("CLOUDINARY_API_SECRET")

if missing:
    # Fail fast so you see the problem at startup, not at request time
    raise RuntimeError(
        f"Missing Cloudinary environment variables: {', '.join(missing)}"
    )

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)
