import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.form import Form
from models.response import FormResponse, AIUsage
from models.subscription import Subscription

router = APIRouter(prefix="/admin", tags=["Admin"])


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


class ApproveSubscriptionRequest(BaseModel):
    expires_days: Optional[int] = 30


class RejectSubscriptionRequest(BaseModel):
    reason: str


# ─── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    skip: int = 0, limit: int = 50,
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    )
    users = result.scalars().all()
    total = (await db.execute(select(func.count(User.id)))).scalar()
    return {
        "total": total,
        "users": [
            {
                "id": str(u.id), "email": u.email, "full_name": u.full_name,
                "is_verified": u.is_verified, "is_active": u.is_active, "is_admin": u.is_admin,
                "created_at": u.created_at.isoformat()
            }
            for u in users
        ]
    }


@router.put("/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot suspend another admin")
    user.is_active = False
    await db.commit()
    return {"message": f"User {user.email} suspended"}


@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    await db.commit()
    return {"message": f"User {user.email} activated"}


# ─── Subscriptions ────────────────────────────────────────────────────────────

@router.get("/subscriptions")
async def list_subscriptions(
    status_filter: Optional[str] = None,
    skip: int = 0, limit: int = 50,
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Subscription).order_by(Subscription.created_at.desc())
    if status_filter:
        query = query.where(Subscription.status == status_filter)
    result = await db.execute(query.offset(skip).limit(limit))
    subs = result.scalars().all()
    return {
        "subscriptions": [
            {
                "id": str(s.id), "user_id": str(s.user_id), "plan": s.plan,
                "status": s.status, "payment_screenshot": s.payment_screenshot,
                "rejection_reason": s.rejection_reason,
                "started_at": s.started_at.isoformat() if s.started_at else None,
                "expires_at": s.expires_at.isoformat() if s.expires_at else None,
                "created_at": s.created_at.isoformat()
            }
            for s in subs
        ]
    }


@router.put("/subscriptions/{sub_id}/approve")
async def approve_subscription(
    sub_id: str,
    req: ApproveSubscriptionRequest,
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Subscription).where(Subscription.id == uuid.UUID(sub_id)))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.status = "active"
    sub.approved_by = admin.id
    sub.started_at = datetime.utcnow()
    sub.expires_at = datetime.utcnow() + timedelta(days=req.expires_days or 30)

    # Expire all other active subs for this user
    other_result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == sub.user_id,
            Subscription.id != sub.id,
            Subscription.status == "active"
        )
    )
    for old_sub in other_result.scalars().all():
        old_sub.status = "expired"

    await db.commit()
    return {"message": f"Subscription approved — plan: {sub.plan}, expires in {req.expires_days} days"}


@router.put("/subscriptions/{sub_id}/reject")
async def reject_subscription(
    sub_id: str,
    req: RejectSubscriptionRequest,
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Subscription).where(Subscription.id == uuid.UUID(sub_id)))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.status = "rejected"
    sub.rejection_reason = req.reason
    await db.commit()
    return {"message": "Subscription rejected"}


# ─── Platform Analytics ───────────────────────────────────────────────────────

@router.get("/analytics")
async def platform_analytics(
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_forms = (await db.execute(select(func.count(Form.id)))).scalar()
    total_responses = (await db.execute(select(func.count(FormResponse.id)))).scalar()
    total_ai_calls = (await db.execute(select(func.count(AIUsage.id)))).scalar()
    pending_subs = (await db.execute(
        select(func.count(Subscription.id)).where(Subscription.status == "pending")
    )).scalar()
    active_subs = (await db.execute(
        select(func.count(Subscription.id)).where(Subscription.status == "active", Subscription.plan != "free")
    )).scalar()

    return {
        "users": {"total": total_users},
        "forms": {"total": total_forms},
        "responses": {"total": total_responses},
        "ai_usage": {"total_calls": total_ai_calls},
        "subscriptions": {
            "active_paid": active_subs,
            "pending_approval": pending_subs
        }
    }


@router.get("/ai-usage")
async def ai_usage_report(
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import text
    result = await db.execute(
        select(AIUsage.model, AIUsage.action, func.count(AIUsage.id).label("count"))
        .group_by(AIUsage.model, AIUsage.action)
        .order_by(func.count(AIUsage.id).desc())
    )
    rows = result.all()
    return {
        "breakdown": [
            {"model": r.model, "action": r.action, "count": r.count}
            for r in rows
        ]
    }
