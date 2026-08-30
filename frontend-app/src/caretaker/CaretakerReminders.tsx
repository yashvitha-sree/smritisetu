/**
 * CaretakerReminders.tsx
 * Full reminder management: add, edit, delete, toggle, list.
 * Role theme: Green (#1a7a5e)
 * Clean SVG icons, no decorative emojis in structure.
 */
import { useState, useEffect } from "react";
import { CaretakerShell } from "./CaretakerLayout";
import { getReminders, completeReminder } from "../services/api";

function IconBell({ size = 20 }: { size?: number }) {
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

function IconEdit({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IconTrash({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  time: string;
  frequency: string;
  active: boolean;
  completed: boolean;
}

const INITIAL_REMINDERS: Reminder[] = [
  { id: "1", title: "Take Morning Medicine",  description: "Blood pressure & vitamin tablets", time: "08:00 AM", frequency: "Daily",   active: true,  completed: true  },
  { id: "2", title: "Drink Water",            description: "At least one full glass",         time: "10:00 AM", frequency: "Daily",   active: true,  completed: true  },
  { id: "3", title: "Lunch",                 description: "Light, nutritious meal",          time: "01:00 PM", frequency: "Daily",   active: true,  completed: true  },
  { id: "4", title: "Evening Walk",           description: "15-minute gentle walk",           time: "05:00 PM", frequency: "Daily",   active: true,  completed: false },
  { id: "5", title: "Evening Medicine",       description: "Sleep & supplement tablets",      time: "07:00 PM", frequency: "Daily",   active: true,  completed: false },
  { id: "6", title: "Doctor Appointment",    description: "Monthly check-up",                time: "10:00 AM", frequency: "Monthly", active: true,  completed: false },
];

const FREQS = ["Daily", "Weekly", "Monthly", "Once"];
const BLANK = { title: "", description: "", time: "09:00", frequency: "Daily", active: true };

export default function CaretakerReminders() {
  const [reminders, setReminders]         = useState<Reminder[]>(INITIAL_REMINDERS);
  const [showModal, setShowModal]         = useState(false);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [form, setForm]                   = useState({ ...BLANK });
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null);
  const [filter, setFilter]               = useState<"all"|"pending"|"done">("all");

  useEffect(() => {
    getReminders("demo_patient").then((data) => {
      if (data?.reminders?.length > 0) {
        setReminders(
          data.reminders.map((r: any, i: number) => ({
            id: String(r.id ?? i),
            title: r.title ?? r.reminder_text ?? "Reminder",
            description: r.description ?? r.notes ?? "",
            time: r.scheduled_time ?? r.time ?? "",
            frequency: r.frequency ?? "Daily",
            active: r.active !== false,
            completed: !!r.completed,
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const pendingCount = reminders.filter((r) => !r.completed).length;
  const doneCount    = reminders.filter((r) =>  r.completed).length;

  const filtered = reminders.filter((r) =>
    filter === "pending" ? !r.completed : filter === "done" ? r.completed : true
  );

  function openAdd() { setForm({ ...BLANK }); setEditingId(null); setShowModal(true); }

  function openEdit(r: Reminder) {
    setForm({ title: r.title, description: r.description, time: r.time, frequency: r.frequency, active: r.active });
    setEditingId(r.id);
    setShowModal(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    if (editingId) {
      setReminders((p) => p.map((r) => r.id === editingId ? { ...r, ...form } : r));
    } else {
      setReminders((p) => [{ id: Date.now().toString(), ...form, completed: false }, ...p]);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setReminders((p) => p.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  }

  async function handleToggle(id: string) {
    setReminders((p) => p.map((r) => r.id === id ? { ...r, completed: !r.completed } : r));
    await completeReminder(id).catch(() => {});
  }

  return (
    <CaretakerShell>
      {/* ── HEADER ── */}
      <div className="ds-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="ds-page-eyebrow">PATIENT REMINDERS</p>
          <h1 className="ds-page-title">Reminders Management</h1>
          <p className="ds-page-sub">Add, edit, and schedule daily reminders for Meera.</p>
        </div>
        <button className="ds-btn-primary" onClick={openAdd} id="add-reminder-btn">
          <IconPlus /> Add Reminder
        </button>
      </div>

      {/* ── STATS SUMMARY ── */}
      <div className="ds-section">
        <div className="ds-stats-grid">
          <div className="ds-stat-card">
            <div className="ds-stat-value">{reminders.length}</div>
            <div className="ds-stat-label">Total Reminders</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value" style={{ color: "var(--ds-success)" }}>{doneCount}</div>
            <div className="ds-stat-label">Completed</div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-value" style={{ color: "var(--ds-warning)" }}>{pendingCount}</div>
            <div className="ds-stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="ds-section" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {(["all", "pending", "done"] as const).map((f) => (
            <button
              key={f}
              className={filter === f ? "ds-btn-primary" : "ds-btn-secondary"}
              style={{ padding: "8px 18px", minHeight: 38, fontSize: 14 }}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Reminders" : f === "pending" ? `Pending (${pendingCount})` : `Completed (${doneCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── REMINDER LIST ── */}
      <div className="ds-section">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? (
            <div className="ds-card" style={{ textAlign: "center", padding: 32 }}>
              <p style={{ color: "var(--ds-text3)", margin: "0 0 12px" }}>No reminders found.</p>
              <button className="ds-btn-secondary" onClick={openAdd}>Add First Reminder</button>
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="ds-card"
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "18px 24px",
                  opacity: r.completed ? 0.75 : 1,
                  borderLeft: `4px solid ${r.completed ? "var(--ds-success)" : "var(--role-primary)"}`
                }}
              >
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: r.completed ? "var(--ds-success)" : "var(--role-primary-light)",
                    color: r.completed ? "#fff" : "var(--role-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  {r.completed ? <IconCheck size={20} /> : <IconClock size={20} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ds-text)", marginBottom: 2 }}>{r.title}</div>
                  {r.description && <div style={{ fontSize: 14, color: "var(--ds-text2)" }}>{r.description}</div>}
                  <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--ds-text3)", marginTop: 4 }}>
                    <span>Scheduled: <strong>{r.time}</strong></span>
                    <span>Frequency: <strong>{r.frequency}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    className={r.completed ? "ds-btn-secondary" : "ds-btn-primary"}
                    style={{ fontSize: 13, padding: "8px 14px", minHeight: 38 }}
                    onClick={() => handleToggle(r.id)}
                  >
                    {r.completed ? "Done" : "Mark Done"}
                  </button>
                  <button
                    className="ds-btn-secondary"
                    style={{ padding: "8px 10px", minHeight: 38 }}
                    onClick={() => openEdit(r)}
                    aria-label="Edit reminder"
                  >
                    <IconEdit />
                  </button>
                  <button
                    className="ds-btn-secondary"
                    style={{ padding: "8px 10px", minHeight: 38, color: "var(--ds-error)", borderColor: "var(--ds-border)" }}
                    onClick={() => setDeleteConfirm(r.id)}
                    aria-label="Delete reminder"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="ds-card" style={{ width: "100%", maxWidth: 500, padding: 32 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px", fontSize: 22, color: "var(--ds-text)" }}>
              {editingId ? "Edit Reminder" : "Add New Reminder"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ds-text2)", marginBottom: 6 }}>
                  Reminder Title *
                </label>
                <input
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid var(--ds-border)", background: "var(--ds-surface)", color: "var(--ds-text)", fontSize: 15 }}
                  placeholder="e.g. Morning Medication"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ds-text2)", marginBottom: 6 }}>
                  Description
                </label>
                <input
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid var(--ds-border)", background: "var(--ds-surface)", color: "var(--ds-text)", fontSize: 15 }}
                  placeholder="e.g. Blood pressure tablets"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ds-text2)", marginBottom: 6 }}>Time</label>
                  <input
                    type="time"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid var(--ds-border)", background: "var(--ds-surface)", color: "var(--ds-text)", fontSize: 15 }}
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ds-text2)", marginBottom: 6 }}>Frequency</label>
                  <select
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid var(--ds-border)", background: "var(--ds-surface)", color: "var(--ds-text)", fontSize: 15 }}
                    value={form.frequency}
                    onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                  >
                    {FREQS.map((fr) => <option key={fr}>{fr}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button className="ds-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ds-btn-primary" onClick={handleSave} disabled={!form.title.trim()}>
                {editingId ? "Save Changes" : "Add Reminder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="ds-card" style={{ width: "100%", maxWidth: 400, padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 10px", fontSize: 20, color: "var(--ds-text)" }}>Delete Reminder?</h3>
            <p style={{ color: "var(--ds-text2)", margin: "0 0 20px", fontSize: 14 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="ds-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="ds-btn-primary"
                style={{ background: "var(--ds-error)" }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </CaretakerShell>
  );
}
