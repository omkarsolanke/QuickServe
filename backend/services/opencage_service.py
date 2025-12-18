import requests
import os

OPENCAGE_KEY = os.getenv("OPENCAGE_API_KEY")
BASE_URL = "https://api.opencagedata.com/geocode/v1/json"


def reverse_geocode(lat: float, lng: float):
    """
    Convert latitude/longitude → address
    """
    params = {
        "q": f"{lat},{lng}",
        "key": OPENCAGE_KEY,
        "limit": 1,
        "no_annotations": 1,
    }

    res = requests.get(BASE_URL, params=params, timeout=10)
    res.raise_for_status()

    data = res.json()
    if not data["results"]:
        return None

    r = data["results"][0]
    return {
        "formatted": r.get("formatted"),
        "city": r["components"].get("city")
        or r["components"].get("town")
        or r["components"].get("village"),
        "state": r["components"].get("state"),
        "country": r["components"].get("country"),
        "postcode": r["components"].get("postcode"),
    }


def forward_geocode(address: str):
    """
    Convert address → latitude/longitude
    """
    params = {
        "q": address,
        "key": OPENCAGE_KEY,
        "limit": 1,
        "no_annotations": 1,
    }

    res = requests.get(BASE_URL, params=params, timeout=10)
    res.raise_for_status()

    data = res.json()
    if not data["results"]:
        return None

    geo = data["results"][0]["geometry"]
    return {
        "latitude": geo["lat"],
        "longitude": geo["lng"],
    }
