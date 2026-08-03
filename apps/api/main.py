from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Form Generation SaaS Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

from routers import auth, ai, forms, responses, billing, admin

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(forms.router)
app.include_router(forms.public_router)
app.include_router(responses.router)
app.include_router(billing.router)
app.include_router(admin.router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Formix API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV
    }
