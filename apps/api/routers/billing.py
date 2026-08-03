import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.subscription import Subscription
from models.form import Form

router = APIRouter(prefix="/billing", tags=["Billing"])

PLAN_LIMITS = {
    "free": {"forms": 3, "responses_per_form": 50, "ai_generations": 5},
    "pro":  {"forms": 20, "responses_per_form": 500, "ai_generations": 100},
    "max":  {"forms": -1, "responses_per_form": -1, "ai_generations": -1},  # -1 = unlimited
}

PLAN_PRICES = {
    "free": 0,
    "pro": 80,
    "max": 150,
}

WALLET_NUMBER = "01012345678"  # Owner's wallet — replace in production


class UpgradeRequest(BaseModel):
    plan: str
    payment_screenshot: Optional[str] = None  # URL after Cloudinary upload


@router.get("/plan")
async def get_current_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's current subscription plan and usage stats."""
    # Fetch active subscription
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == current_user.id, Subscription.status == "active")
        .order_by(Subscription.started_at.desc())
    )
    sub = result.scalars().first()
    plan = sub.plan if sub else "free"
    limits = PLAN_LIMITS[plan]

    # Count current usage
    forms_count = await db.execute(
        select(func.count(Form.id)).where(Form.user_id == current_user.id)
    )
    total_forms = forms_count.scalar() or 0

    from models.response import AIUsage
    from datetime import datetime
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    ai_count = await db.execute(
        select(func.count(AIUsage.id))
        .where(AIUsage.user_id == current_user.id, AIUsage.created_at >= month_start)
    )
    total_ai = ai_count.scalar() or 0

    return {
        "plan": plan,
        "status": sub.status if sub else "active",
        "expires_at": sub.expires_at.isoformat() if sub and sub.expires_at else None,
        "limits": limits,
        "usage": {
            "forms": total_forms,
            "ai_generations_this_month": total_ai,
        },
        "price_egp": PLAN_PRICES[plan]
    }


@router.get("/plans")
async def list_plans():
    """Public endpoint — return all plan details."""
    return {
        "plans": [
            {
                "id": "free", "name": "Free", "price_egp": 0,
                "limits": PLAN_LIMITS["free"],
                "features": ["3 forms", "50 responses/form", "Basic analytics", "5 AI generations/month"]
            },
            {
                "id": "pro", "name": "Pro", "price_egp": 80,
                "limits": PLAN_LIMITS["pro"],
                "features": ["20 forms", "500 responses/form", "Advanced analytics", "CSV/Excel export", "100 AI generations/month"]
            },
            {
                "id": "max", "name": "Max", "price_egp": 150,
                "limits": PLAN_LIMITS["max"],
                "features": ["Unlimited forms", "Unlimited responses", "AI insights", "Team collaboration", "Priority support"]
            }
        ]
    }


@router.post("/upgrade")
async def request_upgrade(
    req: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """User submits upgrade request with payment screenshot."""
    if req.plan not in ("pro", "max"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    pending_sub = Subscription(
        user_id=current_user.id,
        plan=req.plan,
        status="pending",
        payment_screenshot=req.payment_screenshot
    )
    db.add(pending_sub)
    await db.commit()
    await db.refresh(pending_sub)

    return {
        "subscription_id": str(pending_sub.id),
        "plan": req.plan,
        "status": "pending",
        "message": "Your upgrade request has been submitted. Admin will review it within 24 hours.",
        "wallet_number": WALLET_NUMBER
    }


@router.get("/payment-info")
async def get_payment_info(plan: str, _: User = Depends(get_current_user)):
    """Return wallet payment instructions for the selected plan."""
    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")
    return {
        "plan": plan,
        "amount_egp": PLAN_PRICES[plan],
        "wallet_number": WALLET_NUMBER,
        "instructions": [
            f"Transfer exactly {PLAN_PRICES[plan]} EGP to wallet: {WALLET_NUMBER}",
            "Take a screenshot of the successful transfer",
            "Upload the screenshot below and click 'Submit Request'",
            "Your plan will be activated within 24 hours after admin approval"
        ]
    }
