import json
import re
import uuid
from typing import Optional
from google import genai as google_genai
from google.genai import types as genai_types
from openai import AsyncOpenAI
from core.config import settings

# Configure Gemini client (new SDK)
_gemini_client = None
if settings.GEMINI_API_KEY:
    _gemini_client = google_genai.Client(api_key=settings.GEMINI_API_KEY)

# Configure OpenAI
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

SCHEMA_EXAMPLE = {
    "id": "uuid",
    "title": "Form Title",
    "description": "Form description",
    "language": "en",
    "sections": [
        {
            "id": "uuid",
            "title": "Section Title",
            "order": 1,
            "fields": [
                {
                    "id": "uuid",
                    "type": "text",
                    "label": "Field Label",
                    "placeholder": "Enter value",
                    "required": True,
                    "order": 1,
                    "options": None,
                    "validation": {"min_length": 2, "max_length": 200}
                }
            ]
        }
    ],
    "settings": {
        "allow_multiple_submissions": False,
        "show_progress_bar": True,
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
}

GENERATION_PROMPT = """You are a professional form builder AI. Generate a complete form schema as JSON.

User request: {user_prompt}
Language: {language}

Return ONLY valid JSON matching this EXACT structure:
{schema_example}

Rules:
- Generate realistic, professional field labels
- Add appropriate validation rules (min_length, max_length, min_value, max_value etc.)
- Group related fields into logical sections
- Use the correct field types: text | email | phone | number | textarea | select | radio | checkbox | toggle | date | time | datetime | file | image | rating | scale | heading | paragraph | divider
- If language is 'ar', write ALL labels and text in Arabic
- Every field must have a unique UUID for 'id'
- Every section must have a unique UUID for 'id'
- Never add commentary or markdown code fences, ONLY raw JSON
- The JSON must be valid and parseable"""

EDIT_PROMPT = """You are editing an existing form. Apply the instruction precisely and return the updated form schema.

Current form schema:
{current_schema}

User instruction: {instruction}

Return ONLY the complete updated JSON schema. No commentary, no markdown fences, just raw JSON."""

TRANSLATE_PROMPT = """You are a professional translator for form builders. Translate ALL text content (labels, placeholders, titles, descriptions, success_message) in the form schema to {target_language}.
Do NOT change field types, IDs, validation rules, or structural properties.

Current form schema:
{current_schema}

Return ONLY the translated JSON schema. No commentary."""


def _inject_uuids(data: dict) -> dict:
    """Ensure all sections and fields have real UUIDs."""
    if "sections" in data:
        for section in data["sections"]:
            if not section.get("id") or section["id"] == "uuid":
                section["id"] = str(uuid.uuid4())
            for field in section.get("fields", []):
                if not field.get("id") or field["id"] == "uuid":
                    field["id"] = str(uuid.uuid4())
    if not data.get("id") or data.get("id") == "uuid":
        data["id"] = str(uuid.uuid4())
    return data


def _extract_json(text: str) -> dict:
    """Extract and parse JSON from model response, stripping markdown fences."""
    text = text.strip()
    # Strip markdown code fences
    text = re.sub(r'^```(?:json)?', '', text, flags=re.MULTILINE).strip()
    text = re.sub(r'```$', '', text, flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI returned invalid JSON: {e}")


async def _call_gemini(prompt: str) -> str:
    if not _gemini_client:
        raise RuntimeError("Gemini API key not configured")
    response = await _gemini_client.aio.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    return response.text


async def _call_openai(prompt: str) -> str:
    if not openai_client:
        raise RuntimeError("OpenAI API key not configured")
    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return response.choices[0].message.content or ""


def _generate_demo_form(prompt: str) -> dict:
    """Keyword-based fallback when both AI providers fail."""
    prompt_lower = prompt.lower()
    is_arabic = any(w in prompt_lower for w in ["arabic", "ar", "عربي", "عربية"])
    
    return _inject_uuids({
        "id": "demo",
        "title": "Contact Us Form" if not is_arabic else "نموذج التواصل معنا",
        "description": "Please fill in your details below." if not is_arabic else "يرجى ملء البيانات أدناه.",
        "language": "ar" if is_arabic else "en",
        "sections": [
            {
                "id": "demo-section",
                "title": "Contact Information" if not is_arabic else "بيانات التواصل",
                "order": 1,
                "fields": [
                    {
                        "id": "demo-field-1",
                        "type": "text",
                        "label": "Full Name" if not is_arabic else "الاسم بالكامل",
                        "placeholder": "Enter your name" if not is_arabic else "اكتب اسمك",
                        "required": True,
                        "order": 1,
                        "options": None,
                        "validation": {"min_length": 2, "max_length": 100}
                    },
                    {
                        "id": "demo-field-2",
                        "type": "email",
                        "label": "Email Address" if not is_arabic else "البريد الإلكتروني",
                        "placeholder": "name@example.com",
                        "required": True,
                        "order": 2,
                        "options": None,
                        "validation": {}
                    },
                    {
                        "id": "demo-field-3",
                        "type": "textarea",
                        "label": "Your Message" if not is_arabic else "رسالتك",
                        "placeholder": "Type your message here..." if not is_arabic else "اكتب رسالتك هنا...",
                        "required": False,
                        "order": 3,
                        "options": None,
                        "validation": {"max_length": 1000}
                    }
                ]
            }
        ],
        "settings": {
            "allow_multiple_submissions": True,
            "show_progress_bar": False,
            "success_message": "Thank you! We'll be in touch soon." if not is_arabic else "شكراً! سنتواصل معك قريباً.",
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
    })


async def generate_form(prompt: str, language: str = "en") -> dict:
    full_prompt = GENERATION_PROMPT.format(
        user_prompt=prompt,
        language=language,
        schema_example=json.dumps(SCHEMA_EXAMPLE, ensure_ascii=False, indent=2)
    )
    try:
        text = await _call_gemini(full_prompt)
        return _inject_uuids(_extract_json(text))
    except Exception as gemini_err:
        try:
            text = await _call_openai(full_prompt)
            return _inject_uuids(_extract_json(text))
        except Exception:
            return _generate_demo_form(prompt)


async def edit_form(current_schema: dict, instruction: str) -> dict:
    full_prompt = EDIT_PROMPT.format(
        current_schema=json.dumps(current_schema, ensure_ascii=False, indent=2),
        instruction=instruction
    )
    try:
        text = await _call_gemini(full_prompt)
        return _inject_uuids(_extract_json(text))
    except Exception:
        try:
            text = await _call_openai(full_prompt)
            return _inject_uuids(_extract_json(text))
        except Exception:
            return current_schema  # Return unchanged on total failure


async def translate_form(current_schema: dict, target_language: str) -> dict:
    full_prompt = TRANSLATE_PROMPT.format(
        current_schema=json.dumps(current_schema, ensure_ascii=False, indent=2),
        target_language=target_language
    )
    try:
        text = await _call_gemini(full_prompt)
        return _inject_uuids(_extract_json(text))
    except Exception:
        try:
            text = await _call_openai(full_prompt)
            return _inject_uuids(_extract_json(text))
        except Exception:
            return current_schema
