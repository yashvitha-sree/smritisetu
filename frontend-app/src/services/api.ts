/**
 * api.ts — All API calls to the FastAPI backend
 * -----------------------------------------------
 * This file is the ONLY place in the frontend that talks to the backend.
 * If the backend URL changes, you only need to update it here.
 *
 * How it works:
 *   1. Try to send data to the backend
 *   2. If the backend is down (offline), save to local storage instead
 *   3. When online again, the sync function sends saved data
 *
 * OFFLINE-FIRST:
 *   The patient should never see an error because of network issues.
 *   Games always work, results are always saved (locally if needed).
 */

// Backend base URL — change this if you deploy to a server
const API_URL = "http://127.0.0.1:8000";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface GameResult {
  game: string;
  score: number;
  correct: number;
  wrong: number;
  accuracy: number;
  patient_id?: string;
  difficulty?: number;
  response_time?: number;
  hints_used?: number;
  completed?: boolean;
}

export interface GameResultResponse {
  status: string;
  session_id: string;
  message: string;
  next_difficulty: number;
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════════
// LOCAL STORAGE KEYS
// ═══════════════════════════════════════════════════════════════

const UNSYNCED_KEY = "cognicare_unsynced_results";

// ═══════════════════════════════════════════════════════════════
// OFFLINE STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

function saveResultLocally(result: GameResult): void {
  // Get existing unsynced results from local storage
  const existing = JSON.parse(
    localStorage.getItem(UNSYNCED_KEY) || "[]"
  ) as GameResult[];

  // Add the new result
  existing.push({
    ...result,
    // Add a local timestamp so we know when it was played
    ...(result as any).timestamp
      ? {}
      : { timestamp: new Date().toISOString() },
  });

  // Save back to local storage
  localStorage.setItem(UNSYNCED_KEY, JSON.stringify(existing));
  console.log("📱 Result saved locally (will sync when online)");
}

function getUnsyncedResults(): GameResult[] {
  return JSON.parse(localStorage.getItem(UNSYNCED_KEY) || "[]");
}

function clearUnsyncedResults(): void {
  localStorage.removeItem(UNSYNCED_KEY);
}

// ═══════════════════════════════════════════════════════════════
// GAME RESULT — Submit after every game
// ═══════════════════════════════════════════════════════════════

export async function submitGameResult(
  result: GameResult
): Promise<GameResultResponse | null> {
  // Add patient_id if not provided
  const payload = {
    patient_id: "demo_patient",
    difficulty: 1,
    response_time: 0,
    hints_used: 0,
    completed: true,
    ...result,
  };

  try {
    const response = await fetch(`${API_URL}/games/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Game result sent to backend:", data);

    // Try to sync any previously unsynced results
    syncOfflineResults();

    return data as GameResultResponse;
  } catch (error) {
    // Backend is unavailable — save locally
    console.warn("⚠️ Backend unavailable, saving locally:", error);
    saveResultLocally(payload);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// SYNC — Send offline results when back online
// ═══════════════════════════════════════════════════════════════

export async function syncOfflineResults(): Promise<void> {
  const unsynced = getUnsyncedResults();

  if (unsynced.length === 0) return;

  try {
    const response = await fetch(`${API_URL}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: unsynced }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Synced ${data.saved} offline results`);
      clearUnsyncedResults();
    }
  } catch {
    // Still offline — results remain in local storage for later
    console.log("📴 Still offline, results queued for sync");
  }
}

// ═══════════════════════════════════════════════════════════════
// PATIENT PROGRESS
// ═══════════════════════════════════════════════════════════════

export async function getPatientProgress(patientId: string = "demo_patient") {
  try {
    const response = await fetch(`${API_URL}/patients/${patientId}/progress`);
    if (!response.ok) throw new Error("Failed to fetch progress");
    return await response.json();
  } catch (error) {
    console.error("Could not fetch progress:", error);
    return null;
  }
}

export async function getRecommendation(patientId: string = "demo_patient") {
  try {
    const response = await fetch(
      `${API_URL}/patients/${patientId}/recommendations`
    );
    if (!response.ok) throw new Error("Failed to fetch recommendation");
    return await response.json();
  } catch (error) {
    console.error("Could not fetch recommendation:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// REMINDERS
// ═══════════════════════════════════════════════════════════════

export async function getReminders(patientId: string = "demo_patient") {
  try {
    const response = await fetch(`${API_URL}/reminders/${patientId}`);
    if (!response.ok) throw new Error("Failed to fetch reminders");
    return await response.json();
  } catch (error) {
    console.error("Could not fetch reminders:", error);
    return null;
  }
}

export async function completeReminder(reminderId: string) {
  try {
    const response = await fetch(
      `${API_URL}/reminders/${reminderId}/complete`,
      { method: "POST" }
    );
    if (!response.ok) throw new Error("Failed to complete reminder");
    return await response.json();
  } catch (error) {
    console.error("Could not complete reminder:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// CAREGIVER DASHBOARD
// ═══════════════════════════════════════════════════════════════

export async function getCaregiverDashboard(patientId: string = "demo_patient") {
  try {
    const response = await fetch(
      `${API_URL}/caregiver/dashboard/${patientId}`
    );
    if (!response.ok) throw new Error("Failed to fetch dashboard");
    return await response.json();
  } catch (error) {
    console.error("Could not fetch caregiver dashboard:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK — Is the backend running?
// ═══════════════════════════════════════════════════════════════

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Check health and sync on app load
export function initializeApp(): void {
  checkBackendHealth().then((isOnline) => {
    if (isOnline) {
      console.log("🟢 Backend is online");
      syncOfflineResults();
    } else {
      console.log("🔴 Backend is offline — offline mode active");
    }
  });
}
