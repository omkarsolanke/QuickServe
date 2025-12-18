from pydantic import BaseModel, Field
from typing import List, Optional

class AdminStatsOut(BaseModel):
    pending_kyc: int = 0
    total_providers: int = 0
    online_providers: int = 0
    total_customers: int = 0
    total_requests: int = 0
    open_reports: int = 0


class KycRejectIn(BaseModel):
    reason: str = Field(min_length=2, max_length=500)
