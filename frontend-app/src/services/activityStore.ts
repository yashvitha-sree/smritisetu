/**
 * activityStore.ts — Centralized Activity Tracking System for SmritiSetu
 * ---------------------------------------------------------------------
 * A single shared source of truth for all patient activity completions
 * (Cognitive Games, Reminders, Voice Assistant sessions).
 *
 * Provides:
 *   - LocalStorage persistence (`smritisetu_activity_history`)
 *   - Real-time event listener subscription for instant UI updates
 *   - Aggregated metrics (Activities Done, Total Active Time, Recent Accuracy, Category Engagement)
 *   - Shared integration with Adaptive AI & Caretaker views
 */

export interface ActivityRecord {
  id: string;
  activityName: string;
  gameSlug: string;
  category: "Memory" | "Attention" | "Language" | "Auditory" | "Recall" | "Routine";
  completedAt: string; // ISO string
  formattedDate: string; // "30 Aug 2026, 4:30 PM"
  completed: boolean;
  score: number;
  totalPossible: number;
  accuracy: number; // percentage 0-100
  timeTakenSeconds: number;
  difficulty: "Easy" | "Medium" | "Hard";
  hintsUsed: number;
  attempts: number;
}

export interface ActivitySummary {
  activitiesDone: number;
  totalTimeMinutes: number;
  totalTimeSeconds: number;
  recentAccuracy: number;
  categoryBreakdown: {
    category: string;
    label: string;
    accuracy: number;
    count: number;
  }[];
}

const STORAGE_KEY = "smritisetu_activity_history";

// Custom listener callback pattern for real-time updates without full page reload
type ActivityChangeListener = (activities: ActivityRecord[]) => void;
const listeners: Set<ActivityChangeListener> = new Set();

/** Get all recorded activities sorted by newest first */
export function getActivities(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialDemoActivities();
    const parsed: ActivityRecord[] = JSON.parse(raw);
    return parsed.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch (e) {
    console.error("Failed to load activity history:", e);
    return [];
  }
}

/** Subscribe to real-time activity changes */
export function subscribeActivities(listener: ActivityChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(activities: ActivityRecord[]): void {
  listeners.forEach((listener) => {
    try {
      listener(activities);
    } catch (e) {
      console.error("Error in activity listener:", e);
    }
  });
}

/** Record a new activity completion */
export function saveActivityRecord(
  recordData: Omit<ActivityRecord, "id" | "completedAt" | "formattedDate"> & {
    id?: string;
    completedAt?: string;
    formattedDate?: string;
  }
): ActivityRecord {
  const current = getActivities();

  const now = new Date();
  const newRecord: ActivityRecord = {
    id: recordData.id || `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    completedAt: recordData.completedAt || now.toISOString(),
    formattedDate: recordData.formattedDate || formatTimestamp(now),
    activityName: recordData.activityName,
    gameSlug: recordData.gameSlug,
    category: recordData.category,
    completed: recordData.completed ?? true,
    score: recordData.score,
    totalPossible: recordData.totalPossible || recordData.score,
    accuracy: Math.min(100, Math.max(0, Math.round(recordData.accuracy))),
    timeTakenSeconds: Math.max(0, recordData.timeTakenSeconds || 0),
    difficulty: recordData.difficulty || "Medium",
    hintsUsed: recordData.hintsUsed || 0,
    attempts: recordData.attempts || 1,
  };

  const updated = [newRecord, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  console.log(`📊 Activity Saved to Central Store: ${newRecord.activityName} (${newRecord.accuracy}% accuracy)`);
  notifyListeners(updated);

  return newRecord;
}

/** Get aggregated summary stats for My Activity dashboard */
export function getActivitySummary(): ActivitySummary {
  const activities = getActivities();

  if (activities.length === 0) {
    return {
      activitiesDone: 0,
      totalTimeMinutes: 0,
      totalTimeSeconds: 0,
      recentAccuracy: 0,
      categoryBreakdown: [
        { category: "Memory",    label: "Memory Activities",   accuracy: 0, count: 0 },
        { category: "Attention", label: "Attention Activities",accuracy: 0, count: 0 },
        { category: "Language",  label: "Language Activities", accuracy: 0, count: 0 },
        { category: "Auditory",  label: "Auditory Activities", accuracy: 0, count: 0 },
        { category: "Recall",    label: "Recall Activities",   accuracy: 0, count: 0 },
      ],
    };
  }

  const activitiesDone = activities.filter((a) => a.completed).length;
  const totalSeconds = activities.reduce((sum, a) => sum + (a.timeTakenSeconds || 0), 0);
  const totalMinutes = Math.round((totalSeconds / 60) * 10) / 10;

  // Calculate recent accuracy (last 10 completed activities)
  const recentCompleted = activities.filter((a) => a.completed).slice(0, 10);
  const recentAccuracy =
    recentCompleted.length > 0
      ? Math.round(recentCompleted.reduce((sum, a) => sum + a.accuracy, 0) / recentCompleted.length)
      : 0;

  // Category breakdown calculation
  const catMap: Record<string, { label: string; totalAccuracy: number; count: number }> = {
    Memory:    { label: "Memory Activities",   totalAccuracy: 0, count: 0 },
    Attention: { label: "Attention Activities",totalAccuracy: 0, count: 0 },
    Language:  { label: "Language Activities", totalAccuracy: 0, count: 0 },
    Auditory:  { label: "Auditory Activities", totalAccuracy: 0, count: 0 },
    Recall:    { label: "Recall Activities",   totalAccuracy: 0, count: 0 },
  };

  activities.forEach((a) => {
    const catKey = a.category in catMap ? a.category : "Memory";
    catMap[catKey].totalAccuracy += a.accuracy;
    catMap[catKey].count += 1;
  });

  const categoryBreakdown = Object.entries(catMap).map(([key, data]) => ({
    category: key,
    label: data.label,
    accuracy: data.count > 0 ? Math.round(data.totalAccuracy / data.count) : 0,
    count: data.count,
  }));

  return {
    activitiesDone,
    totalTimeMinutes: totalMinutes,
    totalTimeSeconds: totalSeconds,
    recentAccuracy,
    categoryBreakdown,
  };
}

/** Initial demo seed activities so patient/caretaker starts with realistic sample history */
function getInitialDemoActivities(): ActivityRecord[] {
  const now = new Date();
  const demoData: ActivityRecord[] = [
    {
      id: "act_demo_1",
      activityName: "Memory Match",
      gameSlug: "memory-match",
      category: "Memory",
      completedAt: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
      formattedDate: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 25)),
      completed: true,
      score: 4,
      totalPossible: 4,
      accuracy: 90,
      timeTakenSeconds: 120,
      difficulty: "Medium",
      hintsUsed: 0,
      attempts: 1,
    },
    {
      id: "act_demo_2",
      activityName: "Word Search",
      gameSlug: "word-search",
      category: "Language",
      completedAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
      formattedDate: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 90)),
      completed: true,
      score: 9,
      totalPossible: 9,
      accuracy: 85,
      timeTakenSeconds: 180,
      difficulty: "Easy",
      hintsUsed: 0,
      attempts: 1,
    },
    {
      id: "act_demo_3",
      activityName: "Musical Memory",
      gameSlug: "musical-memory",
      category: "Auditory",
      completedAt: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
      formattedDate: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 180)),
      completed: true,
      score: 4,
      totalPossible: 4,
      accuracy: 80,
      timeTakenSeconds: 105,
      difficulty: "Medium",
      hintsUsed: 1,
      attempts: 1,
    },
    {
      id: "act_demo_4",
      activityName: "Spot the Odd One",
      gameSlug: "spot-odd-one-out",
      category: "Attention",
      completedAt: new Date(now.getTime() - 1000 * 60 * 300).toISOString(),
      formattedDate: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 300)),
      completed: true,
      score: 5,
      totalPossible: 5,
      accuracy: 100,
      timeTakenSeconds: 95,
      difficulty: "Easy",
      hintsUsed: 0,
      attempts: 1,
    },
    {
      id: "act_demo_5",
      activityName: "Retro Trivia",
      gameSlug: "retro-trivia",
      category: "Recall",
      completedAt: new Date(now.getTime() - 1000 * 60 * 450).toISOString(),
      formattedDate: formatTimestamp(new Date(now.getTime() - 1000 * 60 * 450)),
      completed: true,
      score: 4,
      totalPossible: 5,
      accuracy: 80,
      timeTakenSeconds: 140,
      difficulty: "Easy",
      hintsUsed: 0,
      attempts: 1,
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
  return demoData;
}

/** Clear all activity history (for resetting / testing) */
export function clearAllActivities(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  notifyListeners([]);
}

/** Helper to format date cleanly */
function formatTimestamp(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
