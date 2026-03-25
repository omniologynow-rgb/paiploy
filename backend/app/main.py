from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, connect, webhooks, payments, recovery, dunning, settings

settings = get_settings()

app = FastAPI(
    title="RecoverPay API",
    description="Failed Payment Recovery SaaS Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(connect.router)
app.include_router(webhooks.router)
app.include_router(payments.router)
app.include_router(recovery.router)
app.include_router(dunning.router)
app.include_router(settings.router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RecoverPay API"}


@app.get("/")
async def root():
    return {
        "message": "Welcome to RecoverPay API",
        "docs": "/docs",
        "version": "1.0.0"
    }
