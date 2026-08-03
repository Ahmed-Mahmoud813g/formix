from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.form import Form
from models.response import AIUsage
from schemas.ai import GenerateFormRequest, EditFormRequest, TranslateFormRequest
from services import ai_service

router = APIRouter(prefix="/ai", tags=["AI Form Generation"])

FREE_PLAN_LIMIT = 5  # generations per month (enforced later via subscriptions)


@router.post("/generate")
async def generate_form(
    req: GenerateFormRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a complete form schema from a natural language prompt.
    Primary: Google Gemini 1.5 Flash → Fallback: GPT-4o-mini → Keyword demo form
    """
    form_schema = await ai_service.generate_form(req.prompt, req.language or "en")

    # Log AI usage
    usage_log = AIUsage(
        user_id=current_user.id,
        action="generate",
        model="gemini-1.5-flash"
    )
    db.add(usage_log)

    # Persist the generated form as a draft
    new_form = Form(
        user_id=current_user.id,
        title=form_schema.get("title", "Untitled Form"),
        description=form_schema.get("description"),
        schema=form_schema,
        status="draft",
        theme=form_schema.get("theme", {}),
        settings=form_schema.get("settings", {})
    )
    db.add(new_form)
    await db.commit()
    await db.refresh(new_form)

    return {
        "form_id": str(new_form.id),
        "schema": form_schema,
        "message": "Form generated successfully"
    }


@router.post("/edit")
async def edit_form(
    req: EditFormRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Edit an existing form based on a natural language instruction.
    """
    result = await db.execute(
        select(Form).where(Form.id == UUID(req.form_id), Form.user_id == current_user.id)
    )
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    updated_schema = await ai_service.edit_form(form.schema, req.instruction)

    form.schema = updated_schema
    form.title = updated_schema.get("title", form.title)
    form.description = updated_schema.get("description", form.description)

    # Log AI usage
    usage_log = AIUsage(user_id=current_user.id, action="edit", model="gemini-1.5-flash")
    db.add(usage_log)
    await db.commit()

    return {
        "form_id": req.form_id,
        "schema": updated_schema,
        "message": "Form updated successfully"
    }


@router.post("/translate")
async def translate_form(
    req: TranslateFormRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Translate an existing form schema into the target language.
    """
    result = await db.execute(
        select(Form).where(Form.id == UUID(req.form_id), Form.user_id == current_user.id)
    )
    form = result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

    translated_schema = await ai_service.translate_form(form.schema, req.target_language)

    form.schema = translated_schema
    form.title = translated_schema.get("title", form.title)

    usage_log = AIUsage(user_id=current_user.id, action="translate", model="gemini-1.5-flash")
    db.add(usage_log)
    await db.commit()

    return {
        "form_id": req.form_id,
        "schema": translated_schema,
        "message": f"Form translated to {req.target_language}"
    }
