from openai import OpenAI
from langsmith import traceable
from langsmith.wrappers import wrap_openai

from app.config import settings
from app.prompts.summarize import build_summarize_prompt

client = wrap_openai(OpenAI(api_key=settings.openai_api_key))


@traceable(run_type="llm", name="summarize_document")
def summarize(text: str, source_language: str, summary_length: str = "medium") -> str:
    messages = build_summarize_prompt(text, source_language, summary_length)

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=0.3,
        max_tokens=2048,
    )

    return response.choices[0].message.content.strip()
