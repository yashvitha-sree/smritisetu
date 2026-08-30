/**
 * CaretakerActivity.tsx
 * Shows patient's cognitive game history, scores, and category progress bars.
 * Connected in real-time to centralized activityStore.
 * Role theme: Green (#1a7a5e)
 */
import { useState, useEffect } from "react";
import { CaretakerShell } from "./CaretakerLayout";
import {
  getActivities,
  getActivitySummary,
  subscribeActivities,
  type ActivityRecord,
  type ActivitySummary,
} from "../services/activityStore";

function IconBrain({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.3A3 3 0 0 1 4.5 9.5a3 3 0 0 1 .82-2.08A2.5 2.5 0 0 1 9.5 2z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.3A3 3 0 0 0 19.5 9.5a3 3 0 0 0-.82-2.08A2.5 2.5 0 0 0 14.5 2z"/>
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

export default function CaretakerActivity() {
  const [activities, setActivities] = useState<ActivityRecord[]>(() => getActivities());
  const [summary, setSummary]       = useState<ActivitySummary>(() => getActivitySummary());

  useEffect(() => {
    const update = () => {
      setActivities(getActivities());
      setSummary(getActivitySummary());
    };
    update();

    const unsubscribe = subscribeActivities(() => {
      update();
    });

    return unsubscribe;
  }, []);

  return (
    <CaretakerShell>
      {/* ── HEADER ── */}
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">PATIENT ACTIVITY LOG</p>
        <h1 className="ds-page-title">Meera's Activity</h1>
        <p className="ds-page-sub">A detailed real-time record of cognitive activity sessions and engagement.</p>
      </div>

      {/* ── STATS SUMMARY ── */}
      <div className="ds-section">
        <div className="ds-stats-grid">
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.activitiesDone}</div>
            <div className="ds-stat-label">Activities Completed</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.recentAccuracy}%</div>
            <div className="ds-stat-label">Average Accuracy</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value">{summary.totalTimeMinutes}m</div>
            <div className="ds-stat-label">Total Time Active</div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY BREAKDOWN ── */}
      <div className="ds-section">
        <h2 className="ds-section-title">Cognitive Domain Engagement</h2>
        <div className="ds-card">
          {summary.categoryBreakdown.map((cat) => (
            <div className="ds-progress-row" key={cat.category}>
              <span className="ds-progress-label">{cat.label} ({cat.count} sessions)</span>
              <div className="ds-progress-track">
                <div className="ds-progress-fill" style={{ width: `${cat.accuracy}%` }} />
              </div>
              <span className="ds-progress-pct">{cat.accuracy}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTIVITY TIMELINE ── */}
      <div className="ds-section">
        <h2 className="ds-section-title">Session History</h2>

        {activities.length === 0 ? (
          <div className="ds-card" style={{ textAlign: "center", padding: "36px 24px" }}>
            <p style={{ color: "var(--ds-text2)", margin: 0 }}>No patient activities recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activities.map((a) => (
              <div className="ds-card" key={a.id} style={{ padding: "18px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--role-primary-light)", color: "var(--role-primary)",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconBrain size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ds-text)" }}>{a.activityName}</div>
                      <div style={{ fontSize: 13, color: "var(--ds-text2)", marginTop: 2 }}>
                        {a.formattedDate} &nbsp;•&nbsp; Level: <strong>{a.difficulty}</strong> &nbsp;•&nbsp; Score: <strong>{a.score}/{a.totalPossible}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--role-primary)" }}>{a.accuracy}%</div>
                      <div style={{ fontSize: 12, color: "var(--ds-text3)" }}>{a.timeTakenSeconds}s duration</div>
                    </div>
                    <span className="ds-badge ds-badge-success">Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ds-alert ds-alert-info">
        <IconShield size={18} />
        <p>SmritiSetu activity logs support care coordination — not a medical diagnostic tool.</p>
      </div>
    </CaretakerShell>
  );
}
