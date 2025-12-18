from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


from utils import cloudinary_config

# ✅ FIXED ROUTER IMPORTS
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.requests import requests_router, ai_router
from routers.admin import router as admin_router
from routers.customer import router as customer_router
from routers.provider import (
    provider_router,
    public_provider_router,
)
from routers.provider_location import router as provider_location_router
from routers.provider_kyc import router as provider_kyc_router
from routers.provider_presence import router as provider_presence_router
from routers.location import router as location_router

app = FastAPI(title="QuickServe API")

# -------------------------
# Static uploads (cloud safe)
# -------------------------
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://quickserve-nu.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.trycloudflare\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Routers
# -------------------------
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(requests_router)
app.include_router(ai_router)
app.include_router(customer_router)
app.include_router(admin_router)
app.include_router(provider_router)
app.include_router(provider_location_router)
app.include_router(provider_kyc_router)
app.include_router(provider_presence_router)
app.include_router(public_provider_router)
app.include_router(location_router)

# -------------------------
# Health & root
# -------------------------
@app.get("/")
def root():
    return {"message": "QuickServe API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
