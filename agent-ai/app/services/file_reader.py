import os
from pathlib import Path

from langsmith import traceable

from app.config import settings


@traceable(run_type="tool", name="extract_text")
def extract_text(file_name: str) -> str:
    file_path = Path(settings.upload_dir).resolve() / file_name

    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = file_path.suffix.lower()

    if ext == ".txt":
        return _read_txt(file_path)
    elif ext == ".pdf":
        return _read_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return _read_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _read_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def _read_pdf(path: Path) -> str:
    from PyPDF2 import PdfReader

    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())
    return "\n\n".join(pages)


def _read_docx(path: Path) -> str:
    from docx import Document

    doc = Document(str(path))
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)
    return "\n\n".join(paragraphs)
