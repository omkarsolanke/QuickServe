import os
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _truncate_for_bcrypt(password: str) -> str:
    """
    bcrypt only uses the first 72 bytes; longer inputs raise ValueError.
    Always truncate to 72 characters before hashing / verifying.
    """
    if password is None:
        return ""
    return password[:72]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe = _truncate_for_bcrypt(plain_password)
    return pwd_context.verify(safe, hashed_password)


def get_password_hash(password: str) -> str:
    safe = _truncate_for_bcrypt(password)
    return pwd_context.hash(safe)


def create_access_token(
    *,
    user_id: int,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload = {
        "user_id": user_id,
        "role": role,
        "exp": expire,
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)