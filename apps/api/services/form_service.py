import re
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from models.form import Form
from models.user import User


def _generate_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug).strip('-')
    slug = slug[:80]
    return f"{slug}-{str(uuid.uuid4())[:8]}"


async def get_user_forms(db: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 20):
    result = await db.execute(
        select(Form)
        .where(Form.user_id == user_id)
        .order_by(Form.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_form_by_id(db: AsyncSession, form_id: uuid.UUID, user_id: uuid.UUID) -> Form:
    result = await db.execute(
        select(Form).where(Form.id == form_id, Form.user_id == user_id)
    )
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


async def get_public_form(db: AsyncSession, slug: str) -> Form:
    result = await db.execute(
        select(Form).where(Form.slug == slug, Form.status == "published")
    )
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found or not published")
    # Increment views
    form.views += 1
    await db.commit()
    return form


async def create_empty_form(db: AsyncSession, user_id: uuid.UUID, title: str = "Untitled Form") -> Form:
    form = Form(
        user_id=user_id,
        title=title,
        schema={
            "id": str(uuid.uuid4()),
            "title": title,
            "description": "",
            "language": "en",
            "sections": [],
            "settings": {
                "allow_multiple_submissions": True,
                "show_progress_bar": False,
                "success_message": "Thank you for submitting!",
                "redirect_url": None,
                "close_date": None,
                "max_responses": None
            },
            "theme": {
                "primary_color": "#2563EB",
                "background_color": "#FFFFFF",
                "font_family": "Inter",
                "logo_url": None,
                "border_radius": "md"
            }
        },
        status="draft"
    )
    db.add(form)
    await db.commit()
    await db.refresh(form)
    return form


async def update_form(db: AsyncSession, form_id: uuid.UUID, user_id: uuid.UUID, data: dict) -> Form:
    form = await get_form_by_id(db, form_id, user_id)
    for key, value in data.items():
        if hasattr(form, key) and value is not None:
            setattr(form, key, value)
    form.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(form)
    return form


async def publish_form(db: AsyncSession, form_id: uuid.UUID, user_id: uuid.UUID) -> dict:
    form = await get_form_by_id(db, form_id, user_id)
    if not form.slug:
        form.slug = _generate_slug(form.title)
    form.status = "published"
    form.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(form)

    public_url = f"/f/{form.slug}"
    embed_code = f'<iframe src="{public_url}" width="100%" height="600" frameborder="0"></iframe>'

    return {
        "form_id": str(form.id),
        "slug": form.slug,
        "public_url": public_url,
        "embed_code": embed_code,
        "status": "published"
    }


async def unpublish_form(db: AsyncSession, form_id: uuid.UUID, user_id: uuid.UUID) -> Form:
    form = await get_form_by_id(db, form_id, user_id)
    form.status = "draft"
    form.updated_at = datetime.utcnow()
    await db.commit()
    return form


async def delete_form(db: AsyncSession, form_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    form = await get_form_by_id(db, form_id, user_id)
    await db.delete(form)
    await db.commit()
    return True


async def get_form_stats(db: AsyncSession, form_id: uuid.UUID, user_id: uuid.UUID) -> dict:
    from models.response import FormResponse
    from sqlalchemy import func
    form = await get_form_by_id(db, form_id, user_id)

    count_result = await db.execute(
        select(func.count(FormResponse.id)).where(FormResponse.form_id == form_id)
    )
    response_count = count_result.scalar() or 0

    return {
        "form_id": str(form_id),
        "title": form.title,
        "status": form.status,
        "views": form.views,
        "response_count": response_count,
        "completion_rate": round((response_count / max(form.views, 1)) * 100, 1)
    }
