from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title="TraceAI AI Service", version="0.1.0")
    app.include_router(health_router)
    return app


app = create_app()


@app.get("/")
def root() -> dict[str, str]:
    return {"service": settings.service_name, "status": "ok"}
