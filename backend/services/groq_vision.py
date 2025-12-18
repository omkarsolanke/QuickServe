import json
import os
import logging
from typing import Dict, Any
from groq import Groq

logger = logging.getLogger("quickserve.groq")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("Missing GROQ_API_KEY environment variable")

client = Groq(api_key=GROQ_API_KEY)
VISION_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct"

def analyze_service_image(image_url: str) -> Dict[str, Any]:
    if not image_url.startswith("https://"):
        raise ValueError("Groq vision requires an HTTPS image URL")

    logger.info("Calling Groq vision with URL: %s", image_url)
    try:
        completion = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Identify the home service needed from the image.\n"
                                "Choose ONE from:\n"
                                "Electrical issue, AC Repair, Plumbing leak, Cleaning, "
                                "Carpentry, Appliance repair, Painting.\n\n"
                                "Return ONLY valid JSON:\n"
                                '{ \"service\": \"...\", \"description\": \"...\" }'
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url},
                        },
                    ],
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_completion_tokens=300,
        )
    except Exception as exc:
        logger.exception("Groq API call failed")
        raise RuntimeError(f"Groq API call failed: {exc}") from exc

    try:
        content = completion.choices[0].message.content
        logger.info("Groq raw content: %s", content)
        return json.loads(content)
    except Exception as exc:
        logger.exception("Groq response parsing failed")
        raise RuntimeError(f"Groq response parsing failed: {exc}") from exc
