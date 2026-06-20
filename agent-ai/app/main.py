import os
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault("LANGSMITH_TRACING", "true")

from app.config import settings
from app.models import ProcessRequest, HealthResponse
from app.services.processor import process_document


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"GovLingua AI Service starting on port {settings.port}")
    print(f"Model: {settings.openai_model}")
    print(f"Backend: {settings.backend_url}")
    print(f"LangSmith tracing: {settings.langsmith_tracing}")
    yield
    print("GovLingua AI Service shutting down")


app = FastAPI(
    title="GovLingua AI Service",
    description="Document summarization and translation for Rwandan government offices",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        service="govlingua-ai",
        model=settings.openai_model,
    )


@app.post("/process")
async def process_endpoint(request: ProcessRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(
        process_document,
        document_id=request.documentId,
        reference_id=request.referenceId,
        file_name=request.fileName,
        action=request.action,
        source_language=request.sourceLanguage,
        target_language=request.targetLanguage,
        summary_length=request.summaryLength,
    )
    return {"status": "accepted", "documentId": request.documentId}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
