/**
 * adaptiveAI.ts — AI-Based Adaptive Difficulty System for SmritiSetu
 * ------------------------------------------------------------------
 * Continuously analyzes patient performance (accuracy, completion time,
 * hints used, retries, trends over time) per game and per patient.
 *
 * Automatically recommends & defaults to appropriate difficulty levels
 * (Easy / Medium / Hard) using gradual, safe adjustments.
 *
 * Supports Caretaker Manual Override and positive, encouraging patient messaging.
 */

export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export const DifficultyLevelValues = ["Easy", "Medium", "Hard"] as const;
export type TrendDirection = "up" | "stable" | "down";

export interface SessionRecord {
  id: string;
  gameSlug: string;
  patientId: string;
  difficulty: DifficultyLevel;
  numericDifficulty: number; // 1 = Easy, 2 = Medium, 3 = Hard
  score: number;
  correct: number;
  wrong: number;
  accuracy: number;
  responseTime: number; // seconds
  hintsUsed: number;
  completed: boolean;
  timestamp: string;
}

export interface DifficultyRecommendation {
  gameSlug: string;
  gameTitle: string;
  currentLevel: DifficultyLevel;
  recommendedLevel: DifficultyLevel;
  trendLabel: "Strong Improvement ↑" | "Improving ↑" | "Stable ↔" | "Needs Support ↓";
  trendDirection: TrendDirection;
  recentAccuracy: number;
  avgResponseTime: number;
  avgHintsUsed: number;
  sessionsAnalyzed: number;
  explanation: string;
  isCaretakerOverridden: boolean;
  caretakerLockedLevel?: DifficultyLevel;
}

const HISTORY_KEY_PREFIX = "cognicare_game_history_";
const OVERRIDE_KEY_PREFIX = "cognicare_caretaker_override_";

const GAME_TITLES: Record<string, string> = {
  "memory-match": "Memory Match",
  "musical-memory": "Musical Memory",
  "word-search": "Word Search",
  "spot-odd-one-out": "Spot the Odd One",
  "retro-trivia": "Retro Trivia",
};

/** Map numeric difficulty (1,2,3) to String ("Easy","Medium","Hard") */
export function levelToString(num: number): DifficultyLevel {
  if (num <= 1) return "Easy";
  if (num === 2) return "Medium";
  return "Hard";
}

/** Map String difficulty to numeric (1,2,3) */
export function levelToNumeric(level: DifficultyLevel): number {
  switch (level) {
    case "Easy": return 1;
    case "Medium": return 2;
    case "Hard": return 3;
  }
}

/** Get game session history from local storage */
export function getGameHistory(gameSlug: string, patientId: string = "demo_patient"): SessionRecord[] {
  try {
    const key = `${HISTORY_KEY_PREFIX}${patientId}_${gameSlug}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to read game history:", e);
    return [];
  }
}

/** Save a new game session */
export function recordGameSession(
  session: Omit<SessionRecord, "id" | "timestamp" | "numericDifficulty"> & {
    numericDifficulty?: number;
  }
): DifficultyRecommendation {
  const patientId = session.patientId || "demo_patient";
  const key = `${HISTORY_KEY_PREFIX}${patientId}_${session.gameSlug}`;
  const history = getGameHistory(session.gameSlug, patientId);

  const newRecord: SessionRecord = {
    ...session,
    id: Date.now().toString(),
    numericDifficulty: session.numericDifficulty || levelToNumeric(session.difficulty),
    timestamp: new Date().toISOString(),
  };

  const updatedHistory = [newRecord, ...history].slice(0, 30);
  localStorage.setItem(key, JSON.stringify(updatedHistory));

  console.log(`🧠 AI Recorded session for ${session.gameSlug}: ${session.accuracy}% accuracy at ${session.difficulty} level.`);

  return calculateAdaptiveDifficulty(session.gameSlug, patientId);
}

/** Get caregiver difficulty override if present */
export function getCaretakerOverride(gameSlug: string, patientId: string = "demo_patient"): DifficultyLevel | null {
  try {
    const key = `${OVERRIDE_KEY_PREFIX}${patientId}_${gameSlug}`;
    const val = localStorage.getItem(key);
    return (val as DifficultyLevel) || null;
  } catch {
    return null;
  }
}

/** Set caregiver manual override (or pass null to return to AI Auto mode) */
export function setCaretakerOverride(gameSlug: string, level: DifficultyLevel | null, patientId: string = "demo_patient"): void {
  const key = `${OVERRIDE_KEY_PREFIX}${patientId}_${gameSlug}`;
  if (level) {
    localStorage.setItem(key, level);
    console.log(`🔒 Caretaker locked ${gameSlug} difficulty to: ${level}`);
  } else {
    localStorage.removeItem(key);
    console.log(`🔓 Caretaker unlocked ${gameSlug} difficulty to AI Auto Mode`);
  }
}

/** Core AI Adaptive Algorithm */
export function calculateAdaptiveDifficulty(
  gameSlug: string,
  patientId: string = "demo_patient"
): DifficultyRecommendation {
  const title = GAME_TITLES[gameSlug] || gameSlug;
  const history = getGameHistory(gameSlug, patientId);
  const override = getCaretakerOverride(gameSlug, patientId);

  if (history.length === 0) {
    const initialLevel: DifficultyLevel = override || "Medium";
    return {
      gameSlug,
      gameTitle: title,
      currentLevel: initialLevel,
      recommendedLevel: initialLevel,
      trendLabel: "Stable ↔",
      trendDirection: "stable",
      recentAccuracy: 75,
      avgResponseTime: 0,
      avgHintsUsed: 0,
      sessionsAnalyzed: 0,
      explanation: "New activity — Initialized at a balanced, comfortable starting level.",
      isCaretakerOverridden: !!override,
      caretakerLockedLevel: override || undefined,
    };
  }

  const recent = history.slice(0, 5);
  const sessionsCount = recent.length;

  const totalAccuracy = recent.reduce((sum, s) => sum + (s.accuracy || 0), 0);
  const recentAccuracy = Math.round(totalAccuracy / sessionsCount);

  const totalTime = recent.reduce((sum, s) => sum + (s.responseTime || 0), 0);
  const avgResponseTime = Math.round(totalTime / sessionsCount);

  const totalHints = recent.reduce((sum, s) => sum + (s.hintsUsed || 0), 0);
  const avgHintsUsed = Math.round((totalHints / sessionsCount) * 10) / 10;

  const completedCount = recent.filter(s => s.completed).length;
  const lastSessionLevel = recent[0].difficulty || "Medium";

  let recommendedLevel: DifficultyLevel = lastSessionLevel;
  let trendLabel: "Strong Improvement ↑" | "Improving ↑" | "Stable ↔" | "Needs Support ↓" = "Stable ↔";
  let trendDirection: TrendDirection = "stable";
  let explanation = "";

  if (recentAccuracy >= 88 && completedCount === sessionsCount && avgHintsUsed <= 1) {
    trendLabel = "Strong Improvement ↑";
    trendDirection = "up";
    if (lastSessionLevel === "Easy") recommendedLevel = "Medium";
    else if (lastSessionLevel === "Medium") recommendedLevel = "Hard";
    else recommendedLevel = "Hard";

    explanation = `High accuracy (${recentAccuracy}%) and quick completion over recent sessions. Recommending a gentle increase to ${recommendedLevel}.`;
  } else if (recentAccuracy >= 75) {
    trendLabel = "Improving ↑";
    trendDirection = "up";
    if (lastSessionLevel === "Easy" && sessionsCount >= 3) recommendedLevel = "Medium";
    else recommendedLevel = lastSessionLevel;

    explanation = `Good consistent performance (${recentAccuracy}% accuracy). Maintaining ${recommendedLevel} level for cognitive stability.`;
  } else if (recentAccuracy >= 58) {
    trendLabel = "Stable ↔";
    trendDirection = "stable";
    recommendedLevel = lastSessionLevel;
    explanation = `Balanced performance (${recentAccuracy}% accuracy). Keeping ${recommendedLevel} level to ensure engaging, achievable practice.`;
  } else {
    trendLabel = "Needs Support ↓";
    trendDirection = "down";
    if (lastSessionLevel === "Hard") recommendedLevel = "Medium";
    else if (lastSessionLevel === "Medium") recommendedLevel = "Easy";
    else recommendedLevel = "Easy";

    explanation = `Recent sessions showed challenges (${recentAccuracy}% accuracy). Adjusting to ${recommendedLevel} with supportive guidance.`;
  }

  if (override) {
    return {
      gameSlug,
      gameTitle: title,
      currentLevel: override,
      recommendedLevel: override,
      trendLabel,
      trendDirection,
      recentAccuracy,
      avgResponseTime,
      avgHintsUsed,
      sessionsAnalyzed: sessionsCount,
      explanation: `Locked by Caretaker at ${override} level. (AI calculated ${recommendedLevel}).`,
      isCaretakerOverridden: true,
      caretakerLockedLevel: override,
    };
  }

  return {
    gameSlug,
    gameTitle: title,
    currentLevel: lastSessionLevel,
    recommendedLevel,
    trendLabel,
    trendDirection,
    recentAccuracy,
    avgResponseTime,
    avgHintsUsed,
    sessionsAnalyzed: sessionsCount,
    explanation,
    isCaretakerOverridden: false,
  };
}

export function getAllGameRecommendations(patientId: string = "demo_patient"): DifficultyRecommendation[] {
  const games = ["memory-match", "musical-memory", "word-search", "spot-odd-one-out", "retro-trivia"];
  return games.map(slug => calculateAdaptiveDifficulty(slug, patientId));
}

export function getPatientEncouragementMessage(recommendation: DifficultyRecommendation): string {
  if (recommendation.trendDirection === "up") {
    return "SmritiSetu has personalized this activity for your great progress!";
  } else if (recommendation.trendDirection === "down") {
    return "SmritiSetu has prepared a gentle, comfortable activity for you today.";
  }
  return "SmritiSetu has selected an activity suited to your daily routine.";
}
