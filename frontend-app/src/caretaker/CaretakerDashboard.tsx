/**
 * CaretakerDashboard.tsx — Cognicare Caretaker Dashboard
 * Role theme: Green (#1a7a5e)
 * Global i18n support & AI Adaptive Difficulty Management Matrix.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CaretakerShell } from "./CaretakerLayout";
import { getCaregiverDashboard } from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";
import {
  getAllGameRecommendations,
  setCaretakerOverride,
  type DifficultyLevel,
  type DifficultyRecommendation,
} from "../services/adaptiveAI";

// ── SVG Icons ──────────────────────────────────────────────────
function IconUser({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconBrain({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.3A3 3 0 0 1 4.5 9.5a3 3 0 0 1 .82-2.08A2.5 2.5 0 0 1 9.5 2z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.3A3 3 0 0 0 19.5 9.5a3 3 0 0 0-.82-2.08A2.5 2.5 0 0 0 14.5 2z"/>
    </svg>
  );
}

function IconBell({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function IconPlus({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function IconActivity({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function IconShield({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function IconArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

const RECENT_ACTIVITIES = [
  { name: "Played Memory Match",    time: "10 minutes ago",  perf: "8/10 correct" },
  { name: "Completed Word Search",  time: "1 hour ago",      perf: "7/9 words found" },
  { name: "Played Musical Memory",  time: "2 hours ago",     perf: "5/6 correct" },
  { name: "Played Retro Trivia",    time: "3 hours ago",     perf: "4/5 correct" },
];

export default function CaretakerDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiRecs, setAiRecs] = useState<DifficultyRecommendation[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("goodMorning") : hour < 17 ? t("goodAfternoon") : t("goodEvening");
  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const refreshAiRecs = () => {
    setAiRecs(getAllGameRecommendations("demo_patient"));
  };

  useEffect(() => {
    refreshAiRecs();
    getCaregiverDashboard("demo_patient")
      .then((d) => { setDashboard(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleOverride = (gameSlug: string, level: DifficultyLevel | null) => {
    setCaretakerOverride(gameSlug, level, "demo_patient");
    refreshAiRecs();
  };

  return (
    <CaretakerShell>
      {/* ── PAGE HEADER ── */}
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">{todayStr}</p>
        <h1 className="ds-page-title">{greeting}, Caregiver</h1>
        <p className="ds-page-sub">{t("caretakerDashboardSub")}</p>
      </div>

      {/* ── STATS GRID ── */}
      <div className="ds-section">
        <h2 className="ds-section-title">{t("todaysProgress")}</h2>
        <div className="ds-stats-grid">
          <div className="ds-stat-card">
            <div className="ds-stat-value">{loading ? "Loading…" : dashboard?.patient_name ?? "Meera"}</div>
            <div className="ds-stat-label">{t("patientStatus")}</div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ds-success)", fontWeight: 600 }}>{t("activeDoingWell")}</p>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-value">{loading ? "…" : `${dashboard?.games_today ?? 0}`}</div>
            <div className="ds-stat-label">{t("gamesPlayed")}</div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ds-text2)" }}>{dashboard?.active_time_today ?? 0}m {t("activeTime")}</p>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-value">{loading ? "…" : `${dashboard?.reminders_completed ?? 0}/${dashboard?.reminders_total ?? 0}`}</div>
            <div className="ds-stat-label">{t("remindersTitle")}</div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ds-text2)" }}>{t("completedText")}</p>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-value">2</div>
            <div className="ds-stat-label">{t("navVoice")}</div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ds-text2)" }}>Active</p>
          </div>
        </div>
      </div>

      {/* ── AI ADAPTIVE DIFFICULTY & COGNITIVE PROGRESS MATRIX ── */}
      <div className="ds-section">
        <h2 className="ds-section-title" style={{ gap: 10 }}>
          <span style={{ fontSize: 20 }}>🧠</span> AI Adaptive Difficulty &amp; Cognitive Insights
        </h2>
        <div className="ds-card ds-card-accent">
          <p style={{ margin: "0 0 16px", color: "var(--ds-text2)", fontSize: 14 }}>
            SmritiSetu's AI continually tracks patient performance across cognitive domains to recommend optimal difficulty levels. Caretakers may inspect trends or manually lock difficulty levels.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {aiRecs.map((rec) => (
              <div
                key={rec.gameSlug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "var(--ds-surface2)",
                  border: "1px solid var(--ds-border)",
                  flexWrap: "wrap",
                  gap: 16
                }}
              >
                <div style={{ minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ds-text)" }}>{rec.gameTitle}</div>
                  <div style={{ fontSize: 13, color: "var(--ds-text2)", marginTop: 2 }}>{rec.explanation}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  {/* Trend Badge */}
                  <span
                    className={
                      rec.trendDirection === "up"
                        ? "ds-badge ds-badge-success"
                        : rec.trendDirection === "down"
                        ? "ds-badge ds-badge-warning"
                        : "ds-badge ds-badge-primary"
                    }
                  >
                    {rec.trendLabel}
                  </span>

                  {/* Recommended Level */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ds-text3)" }}>
                      AI Level
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--role-primary)" }}>
                      {rec.recommendedLevel} {rec.isCaretakerOverridden ? "🔒 (Locked)" : ""}
                    </div>
                  </div>

                  {/* Caretaker Manual Override Controls */}
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--ds-text3)", marginRight: 4 }}>Override:</span>
                    {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map((lvl) => {
                      const isSelected = rec.isCaretakerOverridden && rec.caretakerLockedLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          onClick={() => handleOverride(rec.gameSlug, lvl)}
                          style={{
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 6,
                            border: "1px solid var(--ds-border)",
                            background: isSelected ? "var(--role-primary)" : "var(--ds-surface)",
                            color: isSelected ? "#fff" : "var(--ds-text)",
                            cursor: "pointer"
                          }}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                    {rec.isCaretakerOverridden && (
                      <button
                        onClick={() => handleOverride(rec.gameSlug, null)}
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: "1px dashed var(--role-primary)",
                          background: "transparent",
                          color: "var(--role-primary)",
                          cursor: "pointer"
                        }}
                      >
                        Reset AI Auto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PATIENT SUMMARY CARD ── */}
      <div className="ds-section">
        <h2 className="ds-section-title">{t("patientProfileTitle")}</h2>
        <div className="ds-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--role-primary)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>
              M
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--ds-text)" }}>Meera Sharma</h3>
              <p style={{ margin: "2px 0 0", fontSize: 14, color: "var(--ds-text2)" }}>72 years old · Memory Support</p>
            </div>
          </div>
          <button className="ds-btn-secondary" onClick={() => navigate("/caretaker/profile")}>
            {t("navProfile")} <IconArrowRight />
          </button>
        </div>
      </div>

      {/* ── ENGAGEMENT TRENDS ── */}
      {dashboard && (
        <div className="ds-section">
          <h2 className="ds-section-title">{t("categoryEngagement")}</h2>
          <div className="ds-card">
            {[
              ["Memory Activities",   dashboard.memory_trend   ?? 50],
              ["Attention Activities",dashboard.attention_trend ?? 50],
              ["Visual Activities",   dashboard.visual_trend    ?? 50],
              ["Auditory Activities", dashboard.auditory_trend  ?? 50],
              ["Language Activities", dashboard.language_trend  ?? 50],
            ].map(([label, val]) => (
              <div className="ds-progress-row" key={label as string}>
                <span className="ds-progress-label">{label}</span>
                <div className="ds-progress-track">
                  <div className="ds-progress-fill" style={{ width: `${Math.round(val as number)}%` }} />
                </div>
                <span className="ds-progress-pct">{Math.round(val as number)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <div className="ds-section">
        <h2 className="ds-section-title">Quick Actions</h2>
        <div className="ds-actions-grid">
          <button className="ds-action-card" onClick={() => navigate("/caretaker/reminders")}>
            <div className="ds-action-icon"><IconPlus /></div>
            <div className="ds-action-title">{t("addReminder")}</div>
            <div className="ds-action-desc">Create a new reminder for your patient.</div>
          </button>

          <button className="ds-action-card" onClick={() => navigate("/caretaker/activity")}>
            <div className="ds-action-icon"><IconActivity /></div>
            <div className="ds-action-title">{t("caretakerFeature1")}</div>
            <div className="ds-action-desc">See today's games &amp; scores.</div>
          </button>

          <button className="ds-action-card" onClick={() => navigate("/caretaker/profile")}>
            <div className="ds-action-icon"><IconUser /></div>
            <div className="ds-action-title">{t("patientProfileTitle")}</div>
            <div className="ds-action-desc">View medical details &amp; preferences.</div>
          </button>

          <button className="ds-action-card" onClick={() => navigate("/caretaker/reminders")}>
            <div className="ds-action-icon"><IconBell /></div>
            <div className="ds-action-title">{t("caretakerFeature2")}</div>
            <div className="ds-action-desc">Edit or schedule upcoming reminders.</div>
          </button>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div className="ds-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="ds-section-title" style={{ margin: 0 }}>{t("navActivity")}</h2>
          <button className="ds-btn-secondary" style={{ padding: "6px 14px", minHeight: 34, fontSize: 13 }} onClick={() => navigate("/caretaker/activity")}>
            View all <IconArrowRight size={14} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {RECENT_ACTIVITIES.map((item, i) => (
            <div className="ds-card" key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--role-primary-light)", color: "var(--role-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconBrain size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ds-text)" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: "var(--ds-text2)" }}>{item.perf}</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: "var(--ds-text3)" }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="ds-alert ds-alert-info">
        <IconShield size={18} />
        <p>{t("disclaimer")}</p>
      </div>
    </CaretakerShell>
  );
}
