"""
routes/games.py — Game-related API endpoints
---------------------------------------------
Handles:
  POST /games/result  — Save a game result (called after every game)
  GET  /games/results/{patient_id} — Get all results for a patient
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException

from database import get_db
from models import GameResultRequest, GameResultResponse
from services.adaptive_engine import (
    calculate_performance_score,
    recommend_next_difficulty,
)
from services.recommendation_engine import get_recommendation

# APIRouter groups related endpoints together.
# This router is included in main.py.
router = APIRouter(prefix="/games", tags=["Games"])


@router.post("/result", response_model=GameResultResponse, status_code=201)
def save_game_result(data: GameResultRequest):
    """
    Save a game result to the database.
    
    Called by the frontend after every game session.
    Returns:
      - A friendly message for the patient
      - The recommended next difficulty level
      - The recommended next activity
    
    This endpoint is backward compatible:
    The old format (without patient_id, difficulty, etc.) still works.
    """

    # Generate a unique ID for this session
    session_id = str(uuid.uuid4())

    # Use the adaptive engine to calculate how well the patient did
    performance_score = calculate_performance_score(
        accuracy=data.accuracy,
        response_time=data.response_time or 0,
        hints_used=data.hints_used or 0,
        completed=data.completed if data.completed is not None else True,
        difficulty=data.difficulty or 1,
    )

    # Decide the next difficulty
    next_difficulty, patient_message = recommend_next_difficulty(
        performance_score=performance_score,
        current_difficulty=data.difficulty or 1,
    )

    # Get the recommended next activity
    rec = get_recommendation(data.patient_id or "demo_patient")
    recommendation_text = f"{rec['game_icon']} Try {rec['game_title']} next! {rec['reason']}"

    # Save to database
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO game_sessions
              (id, patient_id, game, difficulty, score, correct, wrong,
               accuracy, response_time, hints_used, completed, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            data.patient_id or "demo_patient",
            data.game,
            data.difficulty or 1,
            data.score,
            data.correct,
            data.wrong,
            data.accuracy,
            data.response_time or 0,
            data.hints_used or 0,
            1 if data.completed else 0,
            datetime.now().isoformat(),
        ))
        conn.commit()

    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    conn.close()

    return GameResultResponse(
        status="saved",
        session_id=session_id,
        message=patient_message,
        next_difficulty=next_difficulty,
        recommendation=recommendation_text,
    )


@router.get("/results/{patient_id}")
def get_game_results(patient_id: str):
    """
    Get all game sessions for a specific patient.
    Returns a list of session records, newest first.
    """
    conn = get_db()
    cursor = conn.cursor()

    rows = cursor.execute("""
        SELECT * FROM game_sessions
        WHERE patient_id = ?
        ORDER BY timestamp DESC
        LIMIT 50
    """, (patient_id,)).fetchall()

    conn.close()

    return {
        "patient_id": patient_id,
        "sessions": [dict(row) for row in rows],
        "total": len(rows),
    }
