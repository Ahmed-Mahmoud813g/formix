import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.form import Form
from models.response import FormResponse

router = APIRouter(prefix="/responses", tags=["Responses"])


@router.get("/{form_id}")
async def get_responses(
    form_id: str,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all responses for a form owned by the current user."""
    # Verify form ownership
    form_result = await db.execute(
        select(Form).where(Form.id == uuid.UUID(form_id), Form.user_id == current_user.id)
    )
    form = form_result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    result = await db.execute(
        select(FormResponse)
        .where(FormResponse.form_id == uuid.UUID(form_id))
        .order_by(FormResponse.submitted_at.desc())
        .offset(skip)
        .limit(limit)
    )
    responses = result.scalars().all()

    count_result = await db.execute(
        select(func.count(FormResponse.id)).where(FormResponse.form_id == uuid.UUID(form_id))
    )
    total = count_result.scalar() or 0

    return {
        "total": total,
        "responses": [
            {
                "id": str(r.id),
                "data": r.data,
                "completion_time": r.completion_time,
                "submitted_at": r.submitted_at.isoformat()
            }
            for r in responses
        ]
    }


@router.get("/{form_id}/summary")
async def get_response_summary(
    form_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Aggregate response data per field for charts and analytics."""
    form_result = await db.execute(
        select(Form).where(Form.id == uuid.UUID(form_id), Form.user_id == current_user.id)
    )
    form = form_result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    result = await db.execute(
        select(FormResponse).where(FormResponse.form_id == uuid.UUID(form_id))
    )
    responses = result.scalars().all()
    total = len(responses)

    # Build field map from schema
    field_labels: Dict[str, str] = {}
    field_types: Dict[str, str] = {}
    for section in (form.schema or {}).get("sections", []):
        for field in section.get("fields", []):
            field_labels[field["id"]] = field.get("label", field["id"])
            field_types[field["id"]] = field.get("type", "text")

    # Aggregate
    summary: Dict[str, Any] = {}
    for response in responses:
        for field_id, value in (response.data or {}).items():
            if field_id not in summary:
                summary[field_id] = {
                    "label": field_labels.get(field_id, field_id),
                    "type": field_types.get(field_id, "text"),
                    "count": 0,
                    "values": []
                }
            summary[field_id]["count"] += 1
            if value not in (None, ""):
                summary[field_id]["values"].append(value)

    # For select/radio/checkbox: count frequencies
    for field_id, agg in summary.items():
        field_type = agg["type"]
        if field_type in ("select", "radio", "checkbox", "rating"):
            freq: Dict[str, int] = {}
            for v in agg["values"]:
                if isinstance(v, list):
                    for item in v:
                        freq[str(item)] = freq.get(str(item), 0) + 1
                else:
                    freq[str(v)] = freq.get(str(v), 0) + 1
            agg["frequencies"] = freq
        agg.pop("values")

    return {
        "form_id": form_id,
        "total_responses": total,
        "views": form.views,
        "completion_rate": round((total / max(form.views, 1)) * 100, 1),
        "fields": list(summary.values())
    }


@router.delete("/{form_id}/{response_id}")
async def delete_response(
    form_id: str,
    response_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    form_result = await db.execute(
        select(Form).where(Form.id == uuid.UUID(form_id), Form.user_id == current_user.id)
    )
    if not form_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    resp_result = await db.execute(
        select(FormResponse).where(
            FormResponse.id == uuid.UUID(response_id),
            FormResponse.form_id == uuid.UUID(form_id)
        )
    )
    response = resp_result.scalar_one_or_none()
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response not found")

    await db.delete(response)
    await db.commit()
    return {"message": "Response deleted"}
