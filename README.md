# SMRITISETU — AI-Based Cognitive Gaming & Memory Assistance Platform

> Smart India Hackathon 2025 Prototype

**⚠️ Medical Disclaimer:** This platform supports cognitive engagement and activity monitoring only. It does not provide medical diagnosis or replace professional medical care.

---

## Project Structure

```
cognicare-complete/
├── frontend-app/     ← React + TypeScript + Vite frontend
└── backend/          ← Python FastAPI + SQLite backend
```

---

## Quick Start (Run Both)

### Step 1 — Start the Backend

```bash
cd backend
source venv/bin/activate      # Activate Python environment
uvicorn main:app --reload     # Start FastAPI server
```

Backend runs at: **http://127.0.0.1:8000**
- Health check: http://127.0.0.1:8000/health
- API docs: http://127.0.0.1:8000/docs

### Step 2 — Start the Frontend

Open a **new terminal tab/window**:

```bash
cd frontend-app
npm run dev
```

Frontend runs at: **http://localhost:5173**

### First-time Setup (Backend)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Features

### 5 Cognitive Games
| Game | Focus | Status |
|------|-------|--------|
| 🧩 Memory Match | Memory & attention | ✅ Complete |
| 🎵 Musical Memory | Auditory memory | ✅ Complete |
| 🔤 Word Search | Language & focus | ✅ Complete |
| 💭 Retro Trivia | Long-term memory & recall | ✅ Complete |
| 🔍 Spot the Odd One | Attention & observation | ✅ Complete |

### Backend API
| Endpoint | Description |
|----------|-------------|
| `GET /health` | Server health check |
| `POST /games/result` | Save game result |
| `GET /games/results/{patient_id}` | Get all results |
| `GET /patients/{patient_id}/progress` | Activity progress |
| `GET /patients/{patient_id}/recommendations` | Next activity suggestion |
| `GET /reminders/{patient_id}` | Get reminders |
| `POST /reminders/{id}/complete` | Mark reminder done |
| `GET /caregiver/dashboard/{patient_id}` | Caregiver dashboard |
| `POST /sync` | Sync offline results |

### Key Features
- ✅ Adaptive difficulty engine (rule-based, transparent)
- ✅ Personalized activity recommendations
- ✅ Caregiver dashboard with activity insights
- ✅ Caregiver alerts (safe, non-medical language)
- ✅ Reminder system with completion tracking
- ✅ Voice assistant (browser Speech Recognition)
- ✅ Offline-first (results saved locally when backend unavailable)
- ✅ Auto-sync when back online
- ✅ Demo data seeded automatically
- ✅ Medical disclaimer throughout

---

## Demo

The app auto-seeds demo data for patient **"Meera"** on first launch.
No setup needed — just start both servers and open `http://localhost:5173`.

**Demo flow:**
1. Open the app → see Role Selection page
2. Click "I'm a Patient" → play any of the 5 games
3. Complete a game → result is sent to backend automatically
4. Go to "My Activity" → see real performance data
5. Click "I'm a Caretaker" → see full dashboard with AI insights

---

## Architecture

```
Frontend (React/Vite)
    ↓ fetch() / offline storage
Backend (FastAPI)
    ↓
Adaptive Engine → Difficulty recommendation
    ↓
Recommendation Engine → Next activity
    ↓
SQLite Database
    ↑
Caregiver Dashboard
```
