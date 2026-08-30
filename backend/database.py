"""
database.py — SQLite database setup for COGNICARE
--------------------------------------------------
This file handles:
  - Connecting to the SQLite database file (cognicare.db)
  - Creating all tables if they don't exist yet
  - Providing a reusable database connection to other files

SQLite is a simple file-based database — no server needed.
The database file is created automatically when you first run the app.
"""

import sqlite3
import os

# The database file will be created in the backend/ folder
DATABASE_NAME = os.getenv("DATABASE_NAME", "cognicare.db")


def get_db():
    """
    Returns a SQLite database connection.
    row_factory = sqlite3.Row means rows behave like dictionaries,
    so we can access columns by name (e.g., row["score"]) instead of index.
    """
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Creates all tables if they do not already exist.
    Called once when the FastAPI app starts.
    """
    conn = get_db()
    cursor = conn.cursor()

    # ── PATIENTS ──────────────────────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            created_at  TEXT DEFAULT (datetime('now'))
        )
    """)

    # ── CAREGIVERS ────────────────────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS caregivers (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            patient_id  TEXT,
            created_at  TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    """)

    # ── GAME SESSIONS ─────────────────────────────────────────────────────────
    # One row per completed (or partially played) game session.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS game_sessions (
            id              TEXT PRIMARY KEY,
            patient_id      TEXT NOT NULL DEFAULT 'demo_patient',
            game            TEXT NOT NULL,
            difficulty      INTEGER DEFAULT 1,
            score           INTEGER DEFAULT 0,
            correct         INTEGER DEFAULT 0,
            wrong           INTEGER DEFAULT 0,
            accuracy        REAL DEFAULT 0.0,
            response_time   INTEGER DEFAULT 0,
            hints_used      INTEGER DEFAULT 0,
            completed       INTEGER DEFAULT 0,
            timestamp       TEXT DEFAULT (datetime('now')),
            synced          INTEGER DEFAULT 1,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    """)

    # ── REMINDERS ─────────────────────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id              TEXT PRIMARY KEY,
            patient_id      TEXT NOT NULL DEFAULT 'demo_patient',
            title           TEXT NOT NULL,
            icon            TEXT DEFAULT '🔔',
            scheduled_time  TEXT,
            completed       INTEGER DEFAULT 0,
            completed_at    TEXT,
            created_at      TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database ready: cognicare.db")


def seed_demo_data():
    """
    Inserts sample data so the caregiver dashboard has something to show
    immediately during hackathon demo — without needing real users to play first.
    All rows are clearly marked as demo data.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Only insert if table is empty
    existing = cursor.execute(
        "SELECT COUNT(*) FROM patients"
    ).fetchone()[0]

    if existing > 0:
        conn.close()
        return  # Already seeded

    # Demo patient
    cursor.execute("""
        INSERT INTO patients (id, name) VALUES (?, ?)
    """, ("demo_patient", "Meera"))

    # Demo caregiver
    cursor.execute("""
        INSERT INTO caregivers (id, name, patient_id) VALUES (?, ?, ?)
    """, ("demo_caregiver", "Meera's Family", "demo_patient"))

    # Demo game sessions — 10 sessions across different games
    import uuid
    sessions = [
        # (game, difficulty, score, correct, wrong, accuracy, time, hints, completed)
        ("memory-match",   2, 8,  8, 2, 80.0, 94,  0, 1),
        ("word-search",    1, 5,  5, 1, 83.3, 120, 1, 1),
        ("musical-memory", 2, 4,  4, 2, 66.7, 80,  0, 1),
        ("memory-match",   2, 8,  8, 0, 100.0, 72, 0, 1),
        ("retro-trivia",   1, 3,  3, 1, 75.0, 60,  1, 1),
        ("spot-odd-one-out", 1, 5, 5, 0, 100.0, 45, 0, 1),
        ("word-search",    2, 6,  6, 2, 75.0, 150, 0, 1),
        ("musical-memory", 2, 4,  4, 1, 80.0, 90,  0, 1),
        ("retro-trivia",   2, 4,  4, 2, 66.7, 75,  1, 1),
        ("memory-match",   3, 6,  6, 4, 60.0, 180, 1, 1),
    ]

    for i, (game, diff, score, correct, wrong, acc, time, hints, completed) in enumerate(sessions):
        # Spread sessions over last 7 days
        days_ago = (9 - i) % 7
        cursor.execute("""
            INSERT INTO game_sessions
              (id, patient_id, game, difficulty, score, correct, wrong,
               accuracy, response_time, hints_used, completed, timestamp)
            VALUES (?, 'demo_patient', ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                    datetime('now', ? || ' days'))
        """, (
            str(uuid.uuid4()), game, diff, score, correct, wrong,
            acc, time, hints, completed, f"-{days_ago}"
        ))

    # Demo reminders
    reminders = [
        ("💊", "Take morning medicine",    "9:00 AM",  1),
        ("💧", "Drink a glass of water",   "11:00 AM", 1),
        ("🍽️", "Have lunch",              "1:00 PM",  1),
        ("🚶", "Take a short walk",        "5:00 PM",  0),
        ("💊", "Take evening medicine",    "7:00 PM",  0),
        ("📅", "Doctor's appointment",     "Tomorrow", 0),
    ]

    for icon, title, time, done in reminders:
        cursor.execute("""
            INSERT INTO reminders (id, patient_id, title, icon, scheduled_time, completed)
            VALUES (?, 'demo_patient', ?, ?, ?, ?)
        """, (str(uuid.uuid4()), icon, title, time, done))

    conn.commit()
    conn.close()
    print("✅ Demo data seeded for patient: Meera")
