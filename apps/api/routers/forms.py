import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.form import Form
from models.response import FormResponse
from services import form_service

router = APIRouter(prefix="/forms", tags=["Forms"])

# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class CreateFormRequest(BaseModel):
    title: str = "Untitled Form"

class UpdateFormRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    form_schema: Optional[Dict[str, Any]] = None
    theme: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None

class SubmitResponseRequest(BaseModel):
    data: Dict[str, Any]
    completion_time: Optional[int] = None


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("")
async def list_forms(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    forms = await form_service.get_user_forms(db, current_user.id, skip, limit)
    return {"forms": [{"id": str(f.id), "title": f.title, "status": f.status, "views": f.views, "created_at": f.created_at, "updated_at": f.updated_at} for f in forms]}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_form(
    req: CreateFormRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    form = await form_service.create_empty_form(db, current_user.id, req.title)
    return {"form_id": str(form.id), "title": form.title, "status": form.status, "schema": form.schema}


@router.get("/{form_id}")
async def get_form(
    form_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    form = await form_service.get_form_by_id(db, uuid.UUID(form_id), current_user.id)
    return {"id": str(form.id), "title": form.title, "status": form.status, "schema": form.schema, "theme": form.theme, "settings": form.settings, "views": form.views}


@router.put("/{form_id}")
async def update_form(
    form_id: str,
    req: UpdateFormRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    data = req.model_dump(exclude_none=True)
    if 'form_schema' in data:
        data['schema'] = data.pop('form_schema')
    form = await form_service.update_form(db, uuid.UUID(form_id), current_user.id, data)
    return {"form_id": str(form.id), "message": "Form updated successfully"}


@router.delete("/{form_id}")
async def delete_form(
    form_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await form_service.delete_form(db, uuid.UUID(form_id), current_user.id)
    return {"message": "Form deleted successfully"}


@router.post("/{form_id}/publish")
async def publish_form(
    form_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await form_service.publish_form(db, uuid.UUID(form_id), current_user.id)
    return result


@router.post("/{form_id}/unpublish")
async def unpublish_form(
    form_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await form_service.unpublish_form(db, uuid.UUID(form_id), current_user.id)
    return {"message": "Form reverted to draft"}


@router.get("/{form_id}/stats")
async def get_form_stats(
    form_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stats = await form_service.get_form_stats(db, uuid.UUID(form_id), current_user.id)
    return stats


# ─── Public Endpoints (No Auth) ──────────────────────────────────────────────

public_router = APIRouter(prefix="/f", tags=["Public Forms"])

@public_router.get("/{slug}")
async def get_public_form(slug: str, db: AsyncSession = Depends(get_db)):
    form = await form_service.get_public_form(db, slug)
    return {"id": str(form.id), "title": form.title, "schema": form.schema, "theme": form.theme, "settings": form.settings}


@public_router.post("/{slug}/submit")
async def submit_response(slug: str, req: SubmitResponseRequest, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.future import select
    from models.form import Form as FormModel
    result = await db.execute(select(FormModel).where(FormModel.slug == slug, FormModel.status == "published"))
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found or not accepting responses")

    # Check max_responses
    if form.settings and form.settings.get("max_responses"):
        from sqlalchemy import func
        count_result = await db.execute(
            __import__('sqlalchemy').select(func.count(FormResponse.id)).where(FormResponse.form_id == form.id)
        )
        count = count_result.scalar() or 0
        if count >= form.settings["max_responses"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This form is no longer accepting responses")

    response = FormResponse(
        form_id=form.id,
        data=req.data,
        completion_time=req.completion_time
    )
    db.add(response)
    form.views = (form.views or 0)
    await db.commit()

    success_message = (form.settings or {}).get("success_message", "Thank you for submitting!")
    redirect_url = (form.settings or {}).get("redirect_url")
    return {"message": success_message, "redirect_url": redirect_url}
