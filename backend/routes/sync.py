"""
routes/sync.py — Offline-first sync endpoint
----------------------------------------------
When a patient plays without internet, results are saved in the browser.
When internet returns, the frontend sends all unsynced results here.
"""

from fastapi import APIRouter
from models import SyncRequest
from routes.games import save_game_result

router = APIRouter(tags=["Sync"])


@router.post("/sync")
def sync_offline_results(data: SyncRequest):
    """
    Receive a batch of game results that were saved offline.
    Processes each one through the normal save_game_result flow.
    Returns how many were successfully saved.
    """
    saved = 0
    failed = 0
    errors = []

    for result in data.results:
        try:
            save_game_result(result)
            saved += 1
        except Exception as e:
            failed += 1
            errors.append(str(e))

    return {
        "status": "sync_complete",
        "saved": saved,
        "failed": failed,
        "errors": errors,
    }
