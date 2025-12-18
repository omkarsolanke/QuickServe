import json
from pathlib import Path

SETTINGS_FILE = Path("admin_settings.json")

DEFAULT_SETTINGS = {
    "platform_name": "QuickServe",
    "maintenance_mode": False,
    "default_search_radius_km": 5,
    "max_search_radius_km": 25,
    "provider_auto_online_after_kyc": True,
    "min_base_price": 99,
    "platform_fee_percent": 0,
    "service_types": [
        "AC Repair",
        "Electrician",
        "Plumber",
        "Cleaner",
        "Carpenter",
        "Painter",
        "Appliance repair",
    ],
    "request_statuses": [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
    ],
}


def load_settings():
    if not SETTINGS_FILE.exists():
        return DEFAULT_SETTINGS

    try:
        data = json.loads(SETTINGS_FILE.read_text())
        return {**DEFAULT_SETTINGS, **data}
    except Exception:
        return DEFAULT_SETTINGS


def save_settings(payload: dict):
    SETTINGS_FILE.write_text(json.dumps(payload, indent=2))
    return payload
