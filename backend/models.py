"""
models.py — Data shapes for COGNICARE API
------------------------------------------
Pydantic models define what data the API expects to receive (request)
and what it sends back (response).

Think of them as forms:
  - Request model = what the frontend must send
  - Response model = what the backend sends back

Pydantic automatically validates the data and gives clear error messages.
"""

from pydantic import BaseModel
from typing import Optional


# ═══════════════════════════════════════════════════════════════
# GAME SESSION MODELS
# ═══════════════════════════════════════════════════════════════

class GameResultRequest(BaseModel):
    """
    Data the frontend sends when a patient finishes a game.
    Optional fields have defaults so existing games don't break.
    """
    game: str                          # e.g., "memory-match"
    score: int = 0
    correct: int = 0
    wrong: int = 0
    accuracy: float = 0.0

    # Extended fields (added gradually — all optional for backward compatibility)
    patient_id: Optional[str] = "demo_patient"
    difficulty: Optional[int] = 1
    response_time: Optional[int] = 0   # seconds taken
    hints_used: Optional[int] = 0
    completed: Optional[bool] = True


class GameResultResponse(BaseModel):
    """
    What the backend sends back after saving a game result.
    Includes the adaptive engine's recommendation.
    """
    status: str
    session_id: str
    message: str                       # Friendly message for patient
    next_difficulty: int               # Recommended difficulty for next session
    recommendation: str                # Which activity to try next


# ═══════════════════════════════════════════════════════════════
# PATIENT MODELS
# ═══════════════════════════════════════════════════════════════

class PatientProgress(BaseModel):
    """Summary of a patient's activity across all game categories."""
    patient_id: str
    patient_name: str
    games_completed: int
    total_time_minutes: int
    recent_accuracy: float

    # Per-category activity scores (0–100)
    memory_score: float
    attention_score: float
    visual_score: float
    auditory_score: float
    language_score: float

    # Friendly insight text (NOT a medical diagnosis)
    insight: str


# ═══════════════════════════════════════════════════════════════
# REMINDER MODELS
# ═══════════════════════════════════════════════════════════════

class ReminderCreate(BaseModel):
    """Data needed to create a new reminder."""
    patient_id: str = "demo_patient"
    title: str
    icon: str = "🔔"
    scheduled_time: str


class ReminderResponse(BaseModel):
    """A reminder object returned by the API."""
    id: str
    patient_id: str
    title: str
    icon: str
    scheduled_time: str
    completed: bool
    completed_at: Optional[str] = None


# ═══════════════════════════════════════════════════════════════
# CAREGIVER DASHBOARD MODELS
# ═══════════════════════════════════════════════════════════════

class CaregiverAlert(BaseModel):
    """An alert shown to the caregiver. Never uses medical language."""
    type: str       # "info", "warning"
    message: str    # e.g., "Change in activity pattern detected."


class CaregiverDashboard(BaseModel):
    """Full dashboard data for the caregiver."""
    patient_name: str

    # Today's summary
    games_today: int
    active_time_today: int     # minutes
    reminders_completed: int
    reminders_total: int

    # Trend data (last 7 days)
    memory_trend: float
    attention_trend: float
    visual_trend: float
    auditory_trend: float
    language_trend: float

    # AI-generated insights (activity-based, NOT medical)
    insights: list[str]

    # Alerts (careful language, NOT medical diagnoses)
    alerts: list[CaregiverAlert]

    # Next recommended activity
    recommendation: str


# ═══════════════════════════════════════════════════════════════
# SYNC MODEL (offline-first)
# ═══════════════════════════════════════════════════════════════

class SyncRequest(BaseModel):
    """
    Used when the patient was offline and results were saved locally.
    The frontend sends all unsynced results in one batch.
    """
    results: list[GameResultRequest]
