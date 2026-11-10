import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config import settings
import app.models  # noqa: F401 — registra modelos SQLAlchemy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando BeFit API (catálogo, carrito y precierre)")
    yield
    logger.info("Aplicación detenida")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    redirect_slashes=False
)

cors_origins = list(dict.fromkeys([
    *(settings.BACKEND_CORS_ORIGINS or []),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "BeFit API — catálogo, carrito y precierre",
        "docs": "/docs",
        "api_v1": "/api/v1",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    return JSONResponse(
        get_openapi(title=app.title, version=settings.APP_VERSION, routes=app.routes)
    )


@app.get("/docs", include_in_schema=False)
async def get_documentation():
    return get_swagger_ui_html(openapi_url="/openapi.json", title=app.title)


