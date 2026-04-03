import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.database import engine, Base
from app.config import get_settings
from app.routers import auth, payments, connect, webhooks, recovery, settings, dunning, billing

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app_settings = get_settings()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Paiploy API",
    description="Failed Payment Recovery Platform - Automatically recover failed subscription payments",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
allowed_origins = [app_settings.FRONTEND_URL]
if app_settings.ENVIRONMENT == "development":
    allowed_origins.extend([
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router)
app.include_router(payments.router)
app.include_router(connect.router)
app.include_router(webhooks.router)
app.include_router(recovery.router)
app.include_router(settings.router)
app.include_router(dunning.router)
app.include_router(billing.router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "paiploy-api"}
