/**
 * pages.tsx — SmritiSetu Patient Pages
 * Full multilingual support across 7 NER languages via useLanguage()
 * Patient theme: Blue (#1a5eb8)
 * Includes global GovtTopBar with language selector & accessibility bar on all pages.
 * Connected to centralized activityStore for real-time tracking & persistence.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./i18n/LanguageContext";
import { GovtTopBar } from "./components/GovtTopBar";
import {
  getRecommendation,
  getReminders,
  completeReminder,
} from "./services/api";
import {
  getActivities,
  getActivitySummary,
  subscribeActivities,
  saveActivityRecord,
  type ActivityRecord,
  type ActivitySummary,
} from "./services/activityStore";
import { games } from "./data/data";
import "./design-system.css";

// ─────────────────────────────────────────────────────────────
// SVG ICONS — professional line icons, no emojis
// ─────────────────────────────────────────────────────────────

function IconHome({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function IconBrain({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.3A3 3 0 0 1 4.5 9.5a3 3 0 0 1 .82-2.08A2.5 2.5 0 0 1 9.5 2z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.3A3 3 0 0 0 19.5 9.5a3 3 0 0 0-.82-2.08A2.5 2.5 0 0 0 14.5 2z"/>
    </svg>
  );
}

function IconBell({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function IconActivity({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function IconMic({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function IconLogOut({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function IconPlay({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  );
}

function IconArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconClock({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// PATIENT SIDEBAR
// ─────────────────────────────────────────────────────────────

export function PatientSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const { t }    = useLanguage();

  const PATIENT_NAV = [
    { path: "/patient",    icon: <IconHome />,     label: t("navHome")     },
    { path: "/play",       icon: <IconBrain />,    label: t("navGames")    },
    { path: "/reminders",  icon: <IconBell />,     label: t("navReminders")},
    { path: "/activity",   icon: <IconActivity />, label: t("navActivity") },
    { path: "/voice",      icon: <IconMic />,      label: t("navVoice")    },
  ];

  return (
    <aside className="ds-sidebar">
      <div>
        <span className="ds-logo" onClick={() => navigate("/patient")} role="link" tabIndex={0}>
          SmritiSetu
        </span>
        <div className="ds-role-chip">{t("iAmPatient")}</div>

        <nav className="ds-nav" aria-label="Patient navigation">
          {PATIENT_NAV.map((item) => (
            <button
              key={item.path}
              className={`ds-nav-item ${active === item.path ? "ds-active" : ""}`}
              onClick={() => navigate(item.path)}
              aria-current={active === item.path ? "page" : undefined}
            >
              <span className="ds-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="ds-sidebar-bottom">
        <button className="ds-logout-btn" onClick={() => navigate("/")}>
          <IconLogOut />
          {t("navLogout")}
        </button>
        <p className="ds-sidebar-note">
          A gentle companion for memory, wellbeing, and everyday life.
        </p>
      </div>
    </aside>
  );
}

// Shared layout shell wrapping top bar + sidebar
function PatientShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <GovtTopBar />
      <div className="ds-shell ds-page-enter" style={{ flex: 1 }}>
        <PatientSidebar active={active} />
        <main className="ds-main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("goodMorning") : hour < 17 ? t("goodAfternoon") : t("goodEvening");

  const [recommendation, setRecommendation] = useState<any>(null);
  const [summary, setSummary] = useState<ActivitySummary>(() => getActivitySummary());

  useEffect(() => {
    getRecommendation().then((rec) => rec && setRecommendation(rec));
    const unsubscribe = subscribeActivities(() => {
      setSummary(getActivitySummary());
    });
    return unsubscribe;
  }, []);

  const GAME_ROUTES: Record<string, string> = {
    "memory-match": "/memory-match",
    "musical-memory": "/musical-memory",
    "word-search": "/word-search",
    "retro-trivia": "/retro-trivia",
    "spot-odd-one-out": "/spot-odd-one-out",
  };

  const actions = [
    { icon: <IconBrain size={24} />, title: t("navGames"), description: "Keep your mind active with today's activities.", path: "/play" },
    { icon: <IconBell size={24} />, title: t("navReminders"), description: "See what you need to remember today.", path: "/reminders" },
    { icon: <IconMic size={24} />, title: t("navVoice"), description: "Ask SmritiSetu for help, hands-free.", path: "/voice" },
    { icon: <IconActivity size={24} />, title: t("navActivity"), description: "View your recent progress and scores.", path: "/activity" },
  ];

  return (
    <PatientShell active="/patient">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">{today}</p>
        <h1 className="ds-page-title">{greeting}, Meera</h1>
        <p className="ds-page-sub">{t("patientHomeSub")}</p>
      </div>

      {/* Quick actions */}
      <div className="ds-actions-grid">
        {actions.map((action) => (
          <button
            key={action.title}
            className="ds-action-card"
            onClick={() => navigate(action.path)}
          >
            <div className="ds-action-icon">{action.icon}</div>
            <div className="ds-action-title">{action.title}</div>
            <div className="ds-action-desc">{action.description}</div>
          </button>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="ds-section">
        <h2 className="ds-section-title">{t("todaysSuggestedActivity")}</h2>
        <div className="ds-suggested">
          <div>
            <p className="ds-suggested-label">{t("recommendedForYou")}</p>
            <h3>{recommendation ? recommendation.game_title : t("retroTriviaTitle")}</h3>
            <p>{recommendation ? recommendation.reason : "Take a gentle trip through familiar memories."}</p>
          </div>
          <button
            className="ds-btn-primary"
            onClick={() => {
              const slug = recommendation?.recommended_game || "retro-trivia";
              navigate(GAME_ROUTES[slug] || "/play");
            }}
          >
            {t("startPlaying")} <IconArrowRight />
          </button>
        </div>
      </div>

      {/* Progress summary (Real-time connected) */}
      <div className="ds-section">
        <h2 className="ds-section-title">{t("todaysProgress")}</h2>
        <div className="ds-stats-grid">
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.activitiesDone}</div>
            <div className="ds-stat-label">{t("activitiesDone")}</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.totalTimeMinutes}m</div>
            <div className="ds-stat-label">{t("activeTime")}</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.recentAccuracy}%</div>
            <div className="ds-stat-label">{t("recentAccuracy")}</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value">{games.length}</div>
            <div className="ds-stat-label">{t("activitiesAvailable")}</div>
          </div>
        </div>
      </div>

      {/* Voice help prompt */}
      <div className="ds-section">
        <h2 className="ds-section-title">{t("needHelp")}</h2>
        <div className="ds-card ds-card-accent" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap", padding: "28px 32px" }}>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 20, color: "var(--ds-text)" }}>{t("askSmritiSetu")}</h3>
            <p style={{ margin: 0, color: "var(--ds-text2)", fontSize: 15 }}>
              {t("askSmritiSetuSub")}
            </p>
          </div>
          <button className="ds-btn-primary" onClick={() => navigate("/voice")}>
            <IconMic /> {t("openVoiceAssistant")}
          </button>
        </div>
      </div>
    </PatientShell>
  );
}

// ─────────────────────────────────────────────────────────────
// GAMES PAGE
// ─────────────────────────────────────────────────────────────

export function GamesPage() {
  const navigate = useNavigate();
  const { t }    = useLanguage();

  const GAME_ROUTES: Record<string, string> = {
    "memory-match": "/memory-match",
    "musical-memory": "/musical-memory",
    "word-search": "/word-search",
    "spot-odd-one-out": "/spot-odd-one-out",
    "retro-trivia": "/retro-trivia",
  };

  const allGames = [
    { slug: "memory-match",    title: t("memoryMatchTitle"),   description: "Find and match pairs at your own comfortable pace.", focus: "Memory & Attention" },
    { slug: "musical-memory",  title: t("musicalMemoryTitle"), description: "Listen carefully and match familiar sounds.", focus: "Listening & Memory" },
    { slug: "word-search",     title: t("wordSearchTitle"),    description: "Find familiar words hidden in a simple puzzle.", focus: "Language & Focus" },
    { slug: "spot-odd-one-out",title: t("spotOddTitle"),       description: "Look carefully and find which item is different.", focus: "Observation & Attention" },
    { slug: "retro-trivia",    title: t("retroTriviaTitle"),   description: "Enjoy gentle questions about familiar memories.", focus: "Recall & Memory" },
  ];

  return (
    <PatientShell active="/play">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">Cognitive Activities</p>
        <h1 className="ds-page-title">{t("playTrainTitle")}</h1>
        <p className="ds-page-sub">{t("playTrainSub")}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 }}>
        {allGames.map((game) => (
          <button
            key={game.slug}
            className="ds-game-card"
            onClick={() => navigate(GAME_ROUTES[game.slug] || "/play")}
          >
            <div className="ds-game-icon-box">
              <IconPlay size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="ds-game-title">{game.title}</div>
              <div className="ds-game-desc">{game.description}</div>
              <div className="ds-game-focus">{game.focus}</div>
            </div>
            <div className="ds-game-arrow"><IconArrowRight size={18} /></div>
          </button>
        ))}
      </div>
    </PatientShell>
  );
}

// ─────────────────────────────────────────────────────────────
// REMINDERS PAGE (Patient)
// ─────────────────────────────────────────────────────────────

export function RemindersPage() {
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<any[]>([]);
  const [localReminders, setLocalReminders] = useState([
    { id: 1, time: "9:00 AM",  title: "Morning Medication", description: "Take your morning medicine.", completed: true },
    { id: 2, time: "1:00 PM",  title: "Lunch",              description: "Time to have a healthy lunch.", completed: false },
    { id: 3, time: "6:00 PM",  title: "Evening Walk",       description: "Take a gentle walk outside.", completed: false },
    { id: 4, time: "9:00 PM",  title: "Night Medication",   description: "Take your night medicine.", completed: false },
  ]);

  useEffect(() => {
    getReminders("demo_patient").then((data) => {
      if (data?.reminders) setReminders(data.reminders);
    });
  }, []);

  async function handleToggle(id: string | number, title: string) {
    if (reminders.length > 0) {
      await completeReminder(String(id));
      getReminders("demo_patient").then((data) => {
        if (data?.reminders) setReminders(data.reminders);
      });
    } else {
      setLocalReminders((prev) =>
        prev.map((r) => r.id === id ? { ...r, completed: true } : r)
      );
    }

    // Save reminder completion to central activityStore
    saveActivityRecord({
      activityName: `Reminder: ${title}`,
      gameSlug: "reminder-completion",
      category: "Routine",
      completed: true,
      score: 1,
      totalPossible: 1,
      accuracy: 100,
      timeTakenSeconds: 30,
      difficulty: "Easy",
      hintsUsed: 0,
      attempts: 1,
    });
  }

  const displayReminders = reminders.length > 0
    ? reminders
    : localReminders.map((r) => ({ id: r.id, title: r.title, scheduled_time: r.time, completed: r.completed, description: r.description }));

  return (
    <PatientShell active="/reminders">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">Daily Schedule</p>
        <h1 className="ds-page-title">{t("remindersTitle")}</h1>
        <p className="ds-page-sub">{t("remindersSub")}</p>
      </div>

      <div className="ds-section">
        <h2 className="ds-section-title">{t("todaysSchedule")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {displayReminders.map((reminder) => (
            <div className="ds-card" key={reminder.id}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px",
                opacity: reminder.completed ? 0.75 : 1,
                borderLeft: `3px solid ${reminder.completed ? "var(--ds-success)" : "var(--role-primary)"}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: reminder.completed ? "var(--ds-success)" : "var(--role-primary-light)",
                color: reminder.completed ? "#fff" : "var(--role-primary)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {reminder.completed ? <IconCheck size={20} /> : <IconClock size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ds-text)", marginBottom: 2 }}>{reminder.title}</div>
                {reminder.description && <div style={{ fontSize: 14, color: "var(--ds-text2)" }}>{reminder.description}</div>}
                <div style={{ fontSize: 13, color: "var(--ds-text3)", marginTop: 2 }}>{reminder.scheduled_time}</div>
              </div>
              <button
                className={reminder.completed ? "ds-btn-secondary" : "ds-btn-primary"}
                style={{ fontSize: 14, padding: "10px 18px", minHeight: 42, flexShrink: 0,
                  ...(reminder.completed ? { opacity: 0.6, cursor: "default" } : {}) }}
                onClick={() => !reminder.completed && handleToggle(reminder.id, reminder.title)}
                disabled={reminder.completed}
              >
                {reminder.completed ? t("completedText") : t("markDone")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </PatientShell>
  );
}

// ─────────────────────────────────────────────────────────────
// ACTIVITY PAGE (Patient) — Real-Time Centralized Tracking
// ─────────────────────────────────────────────────────────────

export function ActivityPage() {
  const navigate = useNavigate();
  const { t }    = useLanguage();
  const [activities, setActivities] = useState<ActivityRecord[]>(() => getActivities());
  const [summary, setSummary]       = useState<ActivitySummary>(() => getActivitySummary());

  useEffect(() => {
    // Refresh activities & summary from store
    const update = () => {
      setActivities(getActivities());
      setSummary(getActivitySummary());
    };
    update();

    // Subscribe to real-time updates from activityStore
    const unsubscribe = subscribeActivities(() => {
      update();
    });

    return unsubscribe;
  }, []);

  return (
    <PatientShell active="/activity">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">My Activity</p>
        <h1 className="ds-page-title">{t("myProgressTitle")}</h1>
        <p className="ds-page-sub">{t("myProgressSub")}</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="ds-section">
        <div className="ds-stats-grid">
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.activitiesDone}</div>
            <div className="ds-stat-label">{t("activitiesDone")}</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.totalTimeMinutes}m</div>
            <div className="ds-stat-label">{t("activeTime")}</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.recentAccuracy}%</div>
            <div className="ds-stat-label">{t("recentAccuracy")}</div>
          </div>
        </div>
      </div>

      {/* Category Engagement */}
      <div className="ds-section">
        <h2 className="ds-section-title">{t("categoryEngagement")}</h2>
        <div className="ds-card">
          {summary.categoryBreakdown.map((cat) => (
            <div className="ds-progress-row" key={cat.category}>
              <span className="ds-progress-label">{cat.label}</span>
              <div className="ds-progress-track">
                <div className="ds-progress-fill" style={{ width: `${cat.accuracy}%` }} />
              </div>
              <span className="ds-progress-pct">{cat.accuracy}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Timeline List */}
      <div className="ds-section">
        <h2 className="ds-section-title">Recent Activity History</h2>

        {activities.length === 0 ? (
          /* Empty State if patient hasn't completed anything */
          <div className="ds-card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--role-primary-light)", color: "var(--role-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <IconActivity size={32} />
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 20, color: "var(--ds-text)" }}>No activities yet</h3>
            <p style={{ margin: "0 0 20px", color: "var(--ds-text2)", fontSize: 15 }}>
              Start a cognitive activity to begin tracking your progress.
            </p>
            <button className="ds-btn-primary" onClick={() => navigate("/play")}>
              Start an Activity →
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activities.map((act) => (
              <div
                className="ds-card"
                key={act.id}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", flexWrap: "wrap", gap: 16 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: "var(--role-primary-light)", color: "var(--role-primary)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}
                  >
                    <IconBrain size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ds-text)" }}>{act.activityName}</div>
                    <div style={{ fontSize: 13, color: "var(--ds-text2)", marginTop: 2 }}>
                      {act.formattedDate} &nbsp;•&nbsp; Level: <strong>{act.difficulty}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--role-primary)" }}>
                      {act.accuracy}%
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ds-text3)" }}>
                      {act.timeTakenSeconds}s duration
                    </div>
                  </div>
                  <span className="ds-badge ds-badge-success">Completed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ds-alert ds-alert-info">
        <IconActivity size={18} />
        <p>{t("disclaimer")}</p>
      </div>
    </PatientShell>
  );
}

// ─────────────────────────────────────────────────────────────
// VOICE PAGE
// ─────────────────────────────────────────────────────────────

export function VoicePage() {
  const navigate = useNavigate();
  const { t }    = useLanguage();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const said = event.results[0][0].transcript.toLowerCase();
      setTranscript(said);
      handleVoiceCommand(said);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  function speak(text: string) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN"; u.rate = 0.9;
    window.speechSynthesis.speak(u);
    setResponse(text);

    // Save voice interaction to central store
    saveActivityRecord({
      activityName: "Voice Assistant Interaction",
      gameSlug: "voice-assistant",
      category: "Auditory",
      completed: true,
      score: 1,
      totalPossible: 1,
      accuracy: 100,
      timeTakenSeconds: 15,
      difficulty: "Easy",
      hintsUsed: 0,
      attempts: 1,
    });
  }

  function handleVoiceCommand(cmd: string) {
    if (cmd.includes("game") || cmd.includes("play") || cmd.includes("activity")) {
      speak("Let's play a game! Opening the activities page for you.");
      setTimeout(() => navigate("/play"), 2000);
    } else if (cmd.includes("reminder")) {
      speak("Opening your reminders now.");
      setTimeout(() => navigate("/reminders"), 1500);
    } else if (cmd.includes("progress") || cmd.includes("how am i")) {
      speak("Opening your activity progress.");
      setTimeout(() => navigate("/activity"), 1500);
    } else if (cmd.includes("home")) {
      speak("Taking you home.");
      setTimeout(() => navigate("/patient"), 1500);
    } else {
      speak("I heard you! You can say: play a game, open reminders, show my progress, or go home.");
    }
  }

  function handleMicClick() {
    if (!supported) { setResponse("Voice is not available in your browser. Please use the buttons below."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); }
    else { recognitionRef.current?.start(); setListening(true); setTranscript(""); setResponse(""); }
  }

  const suggestions = [
    { text: "What should I do today?",  command: "what should I do today" },
    { text: "Show my reminders",        command: "show my reminders" },
    { text: "Let's play a game",        command: "let's play a game" },
    { text: "Show my activity",         command: "show my progress" },
  ];

  return (
    <PatientShell active="/voice">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">Voice Assistant</p>
        <h1 className="ds-page-title">{t("voiceAssistantTitle")}</h1>
        <p className="ds-page-sub">{t("voiceAssistantSub")}</p>
      </div>

      <div className="ds-card" style={{ textAlign: "center", padding: "48px 32px", maxWidth: 640, margin: "0 auto 28px" }}>
        <p style={{ color: "var(--ds-text3)", marginBottom: 32, fontSize: 15 }}>
          Tap the microphone and speak your request
        </p>

        <button
          onClick={handleMicClick}
          aria-label={listening ? "Stop listening" : "Start voice recognition"}
          style={{
            width: 100, height: 100, borderRadius: "50%", border: "none", cursor: "pointer",
            background: listening ? "var(--ds-error)" : "var(--role-primary)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: listening
              ? "0 0 0 12px rgba(164,32,32,0.15), 0 8px 24px rgba(164,32,32,0.3)"
              : "0 8px 24px rgba(26,94,184,0.35)",
            transition: "all 0.2s",
          }}
        >
          <IconMic size={36} />
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ds-text)", margin: "0 0 10px" }}>
          {listening ? t("listening") : t("tapToSpeak")}
        </h2>

        {transcript && (
          <p style={{ color: "var(--ds-text2)", margin: "0 0 16px", fontSize: 15 }}>
            You said: "<em>{transcript}</em>"
          </p>
        )}

        {response && (
          <div className="ds-alert ds-alert-info" style={{ textAlign: "left", marginBottom: 20 }}>
            <IconMic size={18} />
            <p>{response}</p>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 20 }}>
          {suggestions.map((s) => (
            <button
              key={s.text}
              className="ds-btn-secondary"
              style={{ fontSize: 14, padding: "10px 16px" }}
              onClick={() => { setTranscript(s.command); handleVoiceCommand(s.command); }}
            >
              {s.text}
            </button>
          ))}
        </div>
      </div>
    </PatientShell>
  );
}