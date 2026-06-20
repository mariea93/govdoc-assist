import httpx
from langsmith import traceable

from app.config import settings


@traceable(run_type="tool", name="update_backend_status")
async def update_processing_status(
    document_id: str,
    status: str,
    summary: str | None = None,
    translation: str | None = None,
    quality_score: float | None = None,
) -> dict:
    url = f"{settings.backend_url}/documents/{document_id}/processing"

    payload: dict = {"status": status}
    if summary is not None:
        payload["summary"] = summary
    if translation is not None:
        payload["translation"] = translation
    if quality_score is not None:
        payload["qualityScore"] = round(quality_score, 1)

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.patch(
            url,
            json=payload,
            headers={"x-processing-api-key": settings.processing_api_key},
        )
        response.raise_for_status()
        return response.json()


async def mark_processing(document_id: str) -> dict:
    return await update_processing_status(document_id, status="processing")


async def mark_completed(
    document_id: str,
    summary: str | None = None,
    translation: str | None = None,
    quality_score: float | None = None,
) -> dict:
    return await update_processing_status(
        document_id,
        status="completed",
        summary=summary,
        translation=translation,
        quality_score=quality_score,
    )


async def mark_failed(document_id: str) -> dict:
    return await update_processing_status(document_id, status="failed")
