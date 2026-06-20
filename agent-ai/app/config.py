from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4.1"
    langsmith_tracing: bool = True
    langsmith_api_key: str = ""
    langsmith_project: str = "govlingua-ai"
    backend_url: str = "http://localhost:3001/api"
    processing_api_key: str = "dev-processing-key"
    upload_dir: str = "../backend/uploads"
    port: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
