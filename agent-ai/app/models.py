from pydantic import BaseModel


class ProcessRequest(BaseModel):
    documentId: str
    referenceId: str
    fileName: str
    action: str
    sourceLanguage: str
    targetLanguage: str
    summaryLength: str = "medium"


class ProcessingResult(BaseModel):
    status: str
    summary: str | None = None
    translation: str | None = None
    qualityScore: float | None = None


class HealthResponse(BaseModel):
    status: str
    service: str
    model: str
