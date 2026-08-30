"""
routes/dashboard.py — Caregiver dashboard API endpoint
-------------------------------------------------------
Handles:
  GET /caregiver/dashboard/{patient_id}
  
Returns a full summary for the caregiver including:
  - Today's activity overview
  - Performance trends
  - AI-generated activity insights (NOT medical diagnoses)
  - Alerts phrased carefully (activity language only)
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from services.recommendation_engine import (
    get_category_scores,
    get_ai_insights,
    get_recommendation,
)

router = APIRouter(prefix="/caregiver", tags=["Caregiver"])


@router.get("/dashboard/{patient_id}")
def get_caregiver_dashboard(patient_id: str):
    """
    Full caregiver dashboard for a patient.
    
    IMPORTANT: All language here is activity-based.
    We never use words like "dementia", "decline", or "worsening".
    We say things like "change in activity pattern" or "lower engagement".
    """
    conn = get_db()
    cursor = conn.cursor()

    # Verify patient exists
    patient = cursor.execute(
        "SELECT * FROM patients WHERE id = ?", (patient_id,)
    ).fetchone()

    if not patient:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    # ── TODAY'S ACTIVITY ─────────────────────────────────────────
    today_sessions = cursor.execute("""
        SELECT * FROM game_sessions
        WHERE patient_id = ?
          AND date(timestamp) = date('now')
    """, (patient_id,)).fetchall()

    games_today = len(today_sessions)
    active_time_today = sum(s["response_time"] for s in today_sessions) // 60  # minutes

    # ── REMINDERS ─────────────────────────────────────────────────
    all_reminders = cursor.execute("""
        SELECT * FROM reminders WHERE patient_id = ?
    """, (patient_id,)).fetchall()

    reminders_total = len(all_reminders)
    reminders_completed = sum(1 for r in all_reminders if r["completed"])

    # ── RECENT SESSIONS (last 7 days) ────────────────────────────
    recent_sessions = cursor.execute("""
        SELECT * FROM game_sessions
        WHERE patient_id = ?
          AND timestamp >= datetime('now', '-7 days')
        ORDER BY timestamp DESC
    """, (patient_id,)).fetchall()

    conn.close()

    # ── CATEGORY SCORES ──────────────────────────────────────────
    scores = get_category_scores(patient_id)

    # ── AI INSIGHTS ──────────────────────────────────────────────
    insights = get_ai_insights(patient_id)

    # ── ALERTS (careful language — activity only) ─────────────────
    alerts = []

    # Alert: Low reminder completion
    if reminders_total > 0:
        completion_rate = reminders_completed / reminders_total
        if completion_rate < 0.5 and reminders_total >= 3:
            alerts.append({
                "type": "warning",
                "message": "Several reminders were not completed recently. "
                           "You may want to check in with your loved one."
            })

    # Alert: No activity in last 2 days
    if not recent_sessions or len(recent_sessions) == 0:
        alerts.append({
            "type": "warning",
            "message": "Change in activity pattern detected. "
                       "No activities were recorded in the past 2 days."
        })

    # Alert: Significantly lower engagement
    avg_score = sum(scores.values()) / len(scores) if scores else 50
    if avg_score < 45:
        alerts.append({
            "type": "info",
            "message": "Activity engagement has been lower than usual recently. "
                       "Gentle encouragement may be helpful."
        })

    # ── RECOMMENDATION ────────────────────────────────────────────
    rec = get_recommendation(patient_id)
    recommendation = f"{rec['game_icon']} {rec['game_title']} — {rec['reason']}"

    return {
        "patient_name": patient["name"],

        # Today
        "games_today": games_today,
        "active_time_today": active_time_today,
        "reminders_completed": reminders_completed,
        "reminders_total": reminders_total,

        # Trends
        "memory_trend": scores.get("memory", 50),
        "attention_trend": scores.get("attention", 50),
        "visual_trend": scores.get("visual", 50),
        "auditory_trend": scores.get("auditory", 50),
        "language_trend": scores.get("language", 50),

        # Insights and alerts
        "insights": insights,
        "alerts": alerts,
        "recommendation": recommendation,

        # Recent sessions (last 5)
        "recent_sessions": [dict(s) for s in recent_sessions[:5]],
    }
