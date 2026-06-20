import json

from openai import OpenAI
from langsmith import traceable
from langsmith.wrappers import wrap_openai

from app.config import settings

client = wrap_openai(OpenAI(api_key=settings.openai_api_key))

QUALITY_SYSTEM_PROMPT = """You are a quality assessment specialist for government document processing. Evaluate the provided output against the source text and return a quality score.

Score on a scale of 0-100 based on these criteria:
- Accuracy (40%): Does the output faithfully represent the source content? No hallucinations?
- Fluency (25%): Is the output grammatically correct and natural in the target language?
- Completeness (20%): Are all key points from the source preserved?
- Terminology (15%): Are official government terms used correctly and consistently?

Return ONLY a JSON object with this exact format:
{"score": <number>, "breakdown": {"accuracy": <number>, "fluency": <number>, "completeness": <number>, "terminology": <number>}}

Each breakdown score is 0-100 for that individual criterion."""


@traceable(run_type="llm", name="evaluate_quality")
def evaluate_quality(
    source_text: str,
    output_text: str,
    task_type: str,
    source_language: str,
    target_language: str,
) -> float:
    truncated_source = source_text[:3000] if len(source_text) > 3000 else source_text
    truncated_output = output_text[:3000] if len(output_text) > 3000 else output_text

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": QUALITY_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""Task type: {task_type}
Source language: {source_language}
Target language: {target_language}

SOURCE TEXT:
{truncated_source}

OUTPUT:
{truncated_output}

Evaluate and return the JSON score:""",
            },
        ],
        temperature=0.1,
        max_tokens=256,
    )

    content = response.choices[0].message.content.strip()

    try:
        if "```" in content:
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()

        result = json.loads(content)
        score = float(result.get("score", 75.0))
        return max(0.0, min(100.0, score))
    except (json.JSONDecodeError, ValueError, KeyError):
        return 75.0
