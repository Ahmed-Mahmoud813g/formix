from pydantic import BaseModel
from typing import Optional

class GenerateFormRequest(BaseModel):
    prompt: str
    language: Optional[str] = "en"

class EditFormRequest(BaseModel):
    form_id: str
    instruction: str

class TranslateFormRequest(BaseModel):
    form_id: str
    target_language: str

class SuggestRequest(BaseModel):
    form_id: str
