import json
from pathlib import Path
from typing import List, Dict, Any


# -----------------------------
# Settings file path
# -----------------------------
SETTINGS_FILE = Path("admin_settings.json")


# -----------------------------
# Default platform settings
# -----------------------------
DEFAULT_SETTINGS: Dict[str, Any] = {
    "platform_name": "QuickServe",
    "maintenance_mode": False,

    # Search / matching
    "default_search_radius_km": 5,
    "max_search_radius_km": 25,

    # Provider behavior
    "provider_auto_online_after_kyc": True,
    "min_base_price": 99,

    # Platform fees
    "platform_fee_percent": 0,

    # Master data
    "service_types": [
        "AC Repair",
        "Electrician",
        "Plumber",
        "Cleaner",
        "Carpenter",
        "Painter",
        "Appliance Repair",
    ],

    "request_statuses": [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
    ],
}


# -----------------------------
# Load settings
# -----------------------------
def load_settings() -> Dict[str, Any]:
    """
    Load admin settings from JSON file.
    If file does not exist, return defaults.
    """

    if not SETTINGS_FILE.exists():
        return DEFAULT_SETTINGS.copy()

    try:
        data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))

        # Merge defaults + saved values (safe upgrade)
        merged = DEFAULT_SETTINGS.copy()
        merged.update(data)

        return merged

    except Exception:
        # Fallback to defaults if file is corrupted
        return DEFAULT_SETTINGS.copy()


# -----------------------------
# Save settings
# -----------------------------
def save_settings(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save admin settings to JSON file.
    """

    # Always merge with defaults to avoid missing keys
    merged = DEFAULT_SETTINGS.copy()
    merged.update(payload)

    SETTINGS_FILE.write_text(
        json.dumps(merged, indent=2),
        encoding="utf-8",
    )

    return merged
