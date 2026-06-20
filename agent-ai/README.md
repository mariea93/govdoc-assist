# GovLingua AI Service

AI-powered document summarization and translation service for Rwandan government offices. Uses OpenAI GPT-4.1 with LangSmith tracing.

## Model: GPT-4.1

Selected for:
- **90.75% quality** on Kinyarwanda translation (benchmarked via KinyCOMET)
- **1M token context window** — handles large policy documents without chunking
- **20% cheaper** than GPT-4o with equivalent Kinyarwanda accuracy
- **Excellent instruction following** for reliable structured outputs

## Setup

```bash
cd agent-ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required environment variables:
- `OPENAI_API_KEY` — Your OpenAI API key
- `LANGSMITH_API_KEY` — Your LangSmith API key (get from smith.langchain.com)

## Running

```bash
python -m app.main
```

The service starts on port 8000 (configurable via `PORT` env var).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/process` | Process a document (called by Node.js backend) |

## Architecture

This service is called by the Node.js backend when a document is submitted. It:

1. Receives document metadata via POST /process
2. Reads the file from the shared uploads directory
3. Extracts text (PDF, DOCX, or TXT)
4. Calls GPT-4.1 for summarization and/or translation
5. Evaluates output quality
6. PATCHes results back to the Node.js backend

All operations are traced via LangSmith for observability.

## Supported Actions

- **summarize** — Generates a summary in the source language
- **translate** — Translates the full document to the target language
- **summarize_translate** — Summarizes first, then translates the summary

## Supported Languages

- Kinyarwanda (rw)
- English (en)
- French (fr)
