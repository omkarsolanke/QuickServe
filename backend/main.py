from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
import os
import utils.cloudinary_config
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine
import models

# Routers
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.requests import requests_router, ai_router
from routers.admin import router as admin_router
from routers.customer import router as customer_router  # single alias
from routers.provider import (
    provider_router,
    public_provider_router,
)  # no customer_router alias here
from routers.provider_location import router as provider_location_router
from routers.provider_kyc import router as provider_kyc_router
from routers.provider_presence import router as provider_presence_router
from routers.location import router as location_router

# =========================
# Database init
# =========================
models.Base.metadata.create_all(bind=engine)

# =========================
# App init
# =========================
app = FastAPI(title="QuickServe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.2:5173",
        "http://10.153.157.195:5173",
        "https://rising-twice-under-never.trycloudflare.com",
        "https://*.trycloudflare.com",
        "https://quickserve-nu.vercel.app",
        "https://quickserve-mdn2.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Routers
# =========================
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


@app.get("/health")
def health():
    return {"status": "ok"}
