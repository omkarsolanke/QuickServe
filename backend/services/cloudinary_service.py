import cloudinary.uploader
import logging
from backend.utils import cloudinary_config  # noqa

logger = logging.getLogger("quickserve.cloudinary")

def upload_temp_image(image_bytes: bytes) -> str:
    logger.info("Uploading image to Cloudinary (%d bytes)", len(image_bytes))
    try:
        result = cloudinary.uploader.upload(
            image_bytes,
            folder="quickserve_tmp",
            resource_type="image",
            use_filename=True,
            unique_filename=True,
        )
        logger.info("Cloudinary upload result: %s", result)
    except Exception as exc:
        logger.exception("Cloudinary upload failed")
        raise RuntimeError(f"Cloudinary upload failed: {exc}") from exc

    secure_url = result.get("secure_url")
    if not secure_url:
        raise RuntimeError("Cloudinary upload did not return secure_url")
    if not secure_url.startswith("https://"):
        raise RuntimeError(f"Cloudinary URL is not HTTPS: {secure_url}")
    return secure_url
