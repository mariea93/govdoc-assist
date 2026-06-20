from openai import OpenAI
from langsmith import traceable
from langsmith.wrappers import wrap_openai

from app.config import settings
from app.prompts.translate import build_translate_prompt

client = wrap_openai(OpenAI(api_key=settings.openai_api_key))


@traceable(run_type="llm", name="translate_document")
def translate(text: str, source_language: str, target_language: str) -> str:
    messages = build_translate_prompt(text, source_language, target_language)

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=0.2,
        max_tokens=4096,
    )

    return response.choices[0].message.content.strip()
