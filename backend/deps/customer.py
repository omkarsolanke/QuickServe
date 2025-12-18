from fastapi import Depends, HTTPException
from backend.deps.auth import get_current_user


def customer_required(user: dict = Depends(get_current_user)) -> dict:
    # role is already normalized to lowercase in get_current_user()
    if user.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Customer access required")
    return user
