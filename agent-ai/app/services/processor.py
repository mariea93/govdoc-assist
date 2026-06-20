import asyncio
import traceback

from langsmith import traceable

from app.services.file_reader import extract_text
from app.services.summarizer import summarize
from app.services.translator import translate
from app.utils.backend_client import mark_processing, mark_completed, mark_failed
from app.utils.quality import evaluate_quality


MAX_RETRIES = 3


def _run_with_retry(fn, *args, **kwargs):
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            return fn(*args, **kwargs)
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                import time
                time.sleep(2 ** attempt)
    raise last_error


@traceable(run_type="chain", name="process_document")
async def process_document(
    document_id: str,
    reference_id: str,
    file_name: str,
    action: str,
    source_language: str,
    target_language: str,
    summary_length: str = "medium",
):
    print(f"[AI] Processing {reference_id} | action={action} | {source_language} -> {target_language}")

    try:
        await mark_processing(document_id)
    except Exception as e:
        print(f"[AI] Failed to mark processing for {reference_id}: {e}")
        return

    try:
        text = _run_with_retry(extract_text, file_name)

        if not text or not text.strip():
            print(f"[AI] Empty text extracted from {file_name}")
            await mark_failed(document_id)
            return

        summary_result: str | None = None
        translation_result: str | None = None

        if action in ("summarize", "summarize_translate"):
            summary_result = _run_with_retry(
                summarize, text, source_language, summary_length
            )
            print(f"[AI] Summary generated for {reference_id} ({len(summary_result)} chars)")

        if action in ("translate", "summarize_translate"):
            text_to_translate = summary_result if action == "summarize_translate" else text
            translation_result = _run_with_retry(
                translate, text_to_translate, source_language, target_language
            )
            print(f"[AI] Translation generated for {reference_id} ({len(translation_result)} chars)")

        evaluation_text = translation_result or summary_result or ""
        task_type = "translation" if action == "translate" else "summarization"

        quality_score = _run_with_retry(
            evaluate_quality,
            text,
            evaluation_text,
            task_type,
            source_language,
            target_language,
        )
        print(f"[AI] Quality score for {reference_id}: {quality_score}")

        await mark_completed(
            document_id,
            summary=summary_result,
            translation=translation_result,
            quality_score=quality_score,
        )
        print(f"[AI] Completed processing {reference_id}")

    except Exception as e:
        print(f"[AI] Error processing {reference_id}: {traceback.format_exc()}")
        try:
            await mark_failed(document_id)
        except Exception:
            pass
