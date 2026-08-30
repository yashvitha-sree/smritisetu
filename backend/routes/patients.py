"""
routes/patients.py — Patient-related API endpoints
----------------------------------------------------
Handles:
  GET /patients/{patient_id}            — Get patient info
  GET /patients/{patient_id}/progress   — Get activity progress summary
  GET /patients/{patient_id}/recommendations — Get next activity suggestion
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from services.recommendation_engine import (
    get_recommendation,
    get_category_scores,
)

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/{patient_id}")
def get_patient(patient_id: str):
    """Get basic patient information."""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM patients WHERE id = ?", (patient_id,)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")

    return dict(row)


@router.get("/{patient_id}/progress")
def get_patient_progress(patient_id: str):
    """
    Returns a friendly activity progress summary.
    
    Shows:
      - Games completed
      - Total active time
      - Recent accuracy
      - Per-category activity scores (0–100)
    
    IMPORTANT: All language is activity-based, not medical.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Check patient exists
    patient = cursor.execute(
        "SELECT * FROM patients WHERE id = ?", (patient_id,)
    ).fetchone()

    if not patient:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    # Total games completed
    total_games = cursor.execute("""
        SELECT COUNT(*) FROM game_sessions
        WHERE patient_id = ? AND completed = 1
    """, (patient_id,)).fetchone()[0]

    # Total active time (sum of response_time in seconds → convert to minutes)
    total_seconds = cursor.execute("""
        SELECT COALESCE(SUM(response_time), 0) FROM game_sessions
        WHERE patient_id = ?
    """, (patient_id,)).fetchone()[0]
    total_minutes = round(total_seconds / 60)

    # Recent accuracy (last 10 sessions)
    recent_acc_row = cursor.execute("""
        SELECT AVG(accuracy) FROM game_sessions
        WHERE patient_id = ?
        ORDER BY timestamp DESC
        LIMIT 10
    """, (patient_id,)).fetchone()
    recent_accuracy = round(recent_acc_row[0] or 0, 1)

    conn.close()

    # Get per-category scores
    scores = get_category_scores(patient_id)

    # Generate a friendly overall insight
    avg_score = sum(scores.values()) / len(scores) if scores else 50
    if avg_score >= 75:
        insight = "You've had a lovely week of activities! Keep it up! 🌟"
    elif avg_score >= 50:
        insight = "Great effort this week! Every activity helps. 😊"
    else:
        insight = "Every small activity matters. You're doing wonderfully! 💙"

    return {
        "patient_id": patient_id,
        "patient_name": patient["name"],
        "games_completed": total_games,
        "total_time_minutes": total_minutes,
        "recent_accuracy": recent_accuracy,
        "memory_score": scores.get("memory", 50),
        "attention_score": scores.get("attention", 50),
        "visual_score": scores.get("visual", 50),
        "auditory_score": scores.get("auditory", 50),
        "language_score": scores.get("language", 50),
        "insight": insight,
    }


@router.get("/{patient_id}/recommendations")
def get_recommendations(patient_id: str):
    """
    Get the recommended next activity for a patient.
    Based on recent engagement across all activity categories.
    """
    rec = get_recommendation(patient_id)
    return {
        "patient_id": patient_id,
        "recommended_game": rec["game_slug"],
        "game_title": rec["game_title"],
        "game_icon": rec["game_icon"],
        "reason": rec["reason"],
        "category_scores": rec["scores"],
    }
