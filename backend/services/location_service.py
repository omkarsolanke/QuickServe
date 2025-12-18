import os
import requests

OPENCAGE_KEY = os.getenv("OPENCAGE_API_KEY")
BASE_URL = "https://api.opencagedata.com/geocode/v1/json"


def reverse_geocode(lat: float, lng: float):
    """
    Convert latitude/longitude to address & city using OpenCage
    """
    if lat is None or lng is None:
        return None

    params = {
        "q": f"{lat},{lng}",
        "key": OPENCAGE_KEY,
        "limit": 1,
        "no_annotations": 1,
    }

    res = requests.get(BASE_URL, params=params, timeout=10)
    res.raise_for_status()

    data = res.json()
    if not data.get("results"):
        return None

    r = data["results"][0]
    c = r.get("components", {})

    return {
        "formatted": r.get("formatted"),
        "city": c.get("city") or c.get("town") or c.get("village"),
        "state": c.get("state"),
        "country": c.get("country"),
        "postcode": c.get("postcode"),
    }
