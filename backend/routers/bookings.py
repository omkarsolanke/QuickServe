from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def bookings_root():
    return {"message": "Bookings router working"}
