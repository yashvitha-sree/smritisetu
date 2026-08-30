"""
main.py — COGNICARE FastAPI Backend Entry Point
------------------------------------------------
This is the main file that starts the backend server.

How to run:
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload

Then visit:
  http://127.0.0.1:8000/health   → health check
  http://127.0.0.1:8000/docs    → interactive API documentation (Swagger UI)
  http://127.0.0.1:8000/redoc   → alternative docs

CORS (Cross-Origin Resource Sharing):
  The frontend runs on port 5173 (Vite dev server).
  The backend runs on port 8000.
  CORS allows the frontend to make requests to the backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file (if it exists)
load_dotenv()

# Import our database setup
from database import init_db, seed_demo_data

# Import all route modules
from routes.games import router as games_router
from routes.patients import router as patients_router
from routes.reminders import router as reminders_router
from routes.dashboard import router as dashboard_router
from routes.sync import router as sync_router

# ═══════════════════════════════════════════════════════════════
# CREATE THE FASTAPI APP
# ═══════════════════════════════════════════════════════════════

app = FastAPI(
    title="SMRITISETU API",
    description=(
        "AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Users. "
        "\n\n"
        "⚠️ MEDICAL DISCLAIMER: This platform supports cognitive engagement and activity "
        "monitoring only. It does not provide medical diagnosis or replace professional "
        "medical care."
    ),
    version="1.0.0",
)

# ═══════════════════════════════════════════════════════════════
# CORS — Allow frontend to talk to backend
# ═══════════════════════════════════════════════════════════════

# Read allowed origins from environment variable, or use defaults
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5500,http://127.0.0.1:5500"
)
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════
# STARTUP — Initialize database when app starts
# ═══════════════════════════════════════════════════════════════

@app.on_event("startup")
def startup_event():
    """
    This runs automatically when the server starts.
    Creates all database tables and seeds demo data.
    """
    print("🚀 SMRITISETU Backend starting...")
    init_db()
    seed_demo_data()
    print("✅ Server ready!")


# ═══════════════════════════════════════════════════════════════
# BASIC ROUTES
# ═══════════════════════════════════════════════════════════════

@app.get("/", tags=["Info"])
def root():
    """Welcome message."""
    return {
        "app": "SMRITISETU",
        "version": "1.0.0",
        "description": "AI-Based Cognitive Gaming and Memory Assistance Platform",
        "disclaimer": (
            "This platform supports cognitive engagement and activity monitoring only. "
            "It does not provide medical diagnosis or replace professional medical care."
        ),
        "docs": "/docs",
    }


@app.get("/health", tags=["Info"])
def health_check():
    """
    Health check endpoint.
    Use this to verify the server is running before opening the frontend.
    """
    return {"status": "ok", "message": "SMRITISETU backend is running ✅"}


# ═══════════════════════════════════════════════════════════════
# INCLUDE ALL ROUTERS
# ═══════════════════════════════════════════════════════════════

app.include_router(games_router)
app.include_router(patients_router)
app.include_router(reminders_router)
app.include_router(dashboard_router)
app.include_router(sync_router)
