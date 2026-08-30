"""
routes/reminders.py — Reminder-related API endpoints
------------------------------------------------------
Handles:
  GET    /reminders/{patient_id}          — Get all reminders
  POST   /reminders                       — Add a new reminder
  PUT    /reminders/{reminder_id}         — Update a reminder
  POST   /reminders/{reminder_id}/complete — Mark reminder as done
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from database import get_db
from models import ReminderCreate

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.get("/{patient_id}")
def get_reminders(patient_id: str):
    """Get all reminders for a patient, ordered by scheduled time."""
    conn = get_db()
    rows = conn.execute("""
        SELECT * FROM reminders
        WHERE patient_id = ?
        ORDER BY created_at ASC
    """, (patient_id,)).fetchall()
    conn.close()

    return {
        "patient_id": patient_id,
        "reminders": [dict(row) for row in rows],
        "total": len(rows),
        "completed": sum(1 for r in rows if r["completed"]),
    }


@router.post("/", status_code=201)
def create_reminder(data: ReminderCreate):
    """Add a new reminder for a patient."""
    reminder_id = str(uuid.uuid4())
    conn = get_db()

    try:
        conn.execute("""
            INSERT INTO reminders (id, patient_id, title, icon, scheduled_time)
            VALUES (?, ?, ?, ?, ?)
        """, (
            reminder_id,
            data.patient_id,
            data.title,
            data.icon,
            data.scheduled_time,
        ))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

    conn.close()
    return {"status": "created", "reminder_id": reminder_id}


@router.post("/{reminder_id}/complete")
def complete_reminder(reminder_id: str):
    """Mark a reminder as completed. Records the exact completion time."""
    conn = get_db()
    reminder = conn.execute(
        "SELECT * FROM reminders WHERE id = ?", (reminder_id,)
    ).fetchone()

    if not reminder:
        conn.close()
        raise HTTPException(status_code=404, detail="Reminder not found")

    conn.execute("""
        UPDATE reminders
        SET completed = 1, completed_at = ?
        WHERE id = ?
    """, (datetime.now().isoformat(), reminder_id))
    conn.commit()
    conn.close()

    return {"status": "completed", "reminder_id": reminder_id}


@router.post("/{reminder_id}/uncomplete")
def uncomplete_reminder(reminder_id: str):
    """Toggle a reminder back to incomplete (e.g., if marked by mistake)."""
    conn = get_db()
    conn.execute("""
        UPDATE reminders
        SET completed = 0, completed_at = NULL
        WHERE id = ?
    """, (reminder_id,))
    conn.commit()
    conn.close()
    return {"status": "reset", "reminder_id": reminder_id}
