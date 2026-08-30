/**
 * CaretakerProfile.tsx
 * Patient profile page with details, medical info, and caretaker notes.
 * Role theme: Green (#1a7a5e)
 * Clean SVG icons, professional government healthcare structure.
 */
import { useState } from "react";
import { CaretakerShell } from "./CaretakerLayout";

function IconEdit({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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

const PATIENT = {
  name: "Meera Sharma",
  nickname: "Meera",
  age: 72,
  dob: "15 March, 1954",
  gender: "Female",
  bloodGroup: "B+",
  language: "Assamese, Hindi, English",
  address: "Guwahati, Assam",
  caretakerName: "Priya Sharma",
  relationship: "Daughter",
  emergencyPhone: "+91 98765 43210",
  doctorName: "Dr. Anjali Borah",
  doctorPhone: "+91 94301 23456",
  medicalNotes: "Early-stage memory support. No known allergies.",
  preferences: {
    activities: ["Memory Match", "Retro Trivia", "Musical Memory"],
    music: ["Assamese folk songs", "Classic Melodies"],
    food: ["Rice with dal", "Light vegetable curry", "Chai"],
    reminderTimes: ["8:00 AM", "1:00 PM", "7:00 PM"],
    wakesAt: "6:30 AM",
    sleepsAt: "9:30 PM",
  },
  notes: "Meera loves nature and garden walks. Responds well to gentle music and clear reminders in Assamese or Hindi.",
};

export default function CaretakerProfile() {
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState(PATIENT.notes);

  return (
    <CaretakerShell>
      {/* ── HEADER ── */}
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">PATIENT PROFILE</p>
        <h1 className="ds-page-title">Meera's Profile</h1>
        <p className="ds-page-sub">Personal details, preferences, care team, and daily routine notes.</p>
      </div>

      {/* ── HERO PROFILE CARD ── */}
      <div className="ds-section">
        <div className="ds-card ds-card-accent" style={{ display: "flex", alignItems: "center", gap: 24, padding: "28px 32px" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--role-primary)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, flexShrink: 0 }}>
            M
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "var(--ds-text)" }}>{PATIENT.name}</h2>
            <p style={{ margin: 0, fontSize: 15, color: "var(--ds-text2)" }}>
              {PATIENT.age} years old · {PATIENT.gender} · Blood Group: <strong>{PATIENT.bloodGroup}</strong>
            </p>
            <div style={{ marginTop: 8 }}>
              <span className="ds-badge ds-badge-success">Active Patient</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* ── LEFT COLUMN: PERSONAL INFO & CARE TEAM ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Personal Info */}
          <div className="ds-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "var(--ds-text)" }}>Personal Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ProfileRow label="Full Name" value={PATIENT.name} />
              <ProfileRow label="Date of Birth" value={PATIENT.dob} />
              <ProfileRow label="Gender" value={PATIENT.gender} />
              <ProfileRow label="Blood Group" value={PATIENT.bloodGroup} />
              <ProfileRow label="Languages" value={PATIENT.language} />
              <ProfileRow label="Address" value={PATIENT.address} />
            </div>
          </div>

          {/* Care Team */}
          <div className="ds-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "var(--ds-text)" }}>Care Team &amp; Contacts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ProfileRow label="Primary Caretaker" value={PATIENT.caretakerName} />
              <ProfileRow label="Relationship" value={PATIENT.relationship} />
              <ProfileRow label="Emergency Phone" value={PATIENT.emergencyPhone} highlight />
              <ProfileRow label="Doctor" value={PATIENT.doctorName} />
              <ProfileRow label="Doctor Phone" value={PATIENT.doctorPhone} />
              <ProfileRow label="Medical Notes" value={PATIENT.medicalNotes} />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: PREFERENCES & NOTES ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Preferences */}
          <div className="ds-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "var(--ds-text)" }}>Activity &amp; Personal Preferences</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text3)", textTransform: "uppercase", letterSpacing: 1 }}>
                  Preferred Activities
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {PATIENT.preferences.activities.map(a => (
                    <span key={a} className="ds-badge ds-badge-primary">{a}</span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text3)", textTransform: "uppercase", letterSpacing: 1 }}>
                  Preferred Music
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {PATIENT.preferences.music.map(m => (
                    <span key={m} className="ds-badge ds-badge-primary">{m}</span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ds-text3)", textTransform: "uppercase", letterSpacing: 1 }}>
                  Dietary Preferences
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {PATIENT.preferences.food.map(f => (
                    <span key={f} className="ds-badge ds-badge-success">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="ds-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "var(--ds-text)" }}>Daily Schedule</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--ds-text)" }}>
                <span>Wakes Up</span>
                <strong>{PATIENT.preferences.wakesAt}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--ds-text)" }}>
                <span>Scheduled Reminders</span>
                <strong>{PATIENT.preferences.reminderTimes.join(", ")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--ds-text)" }}>
                <span>Goes to Sleep</span>
                <strong>{PATIENT.preferences.sleepsAt}</strong>
              </div>
            </div>
          </div>

          {/* Caretaker Notes */}
          <div className="ds-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "var(--ds-text)" }}>Caretaker Notes</h3>
              <button
                className="ds-btn-secondary"
                style={{ padding: "6px 12px", minHeight: 34, fontSize: 13 }}
                onClick={() => setEditNotes(!editNotes)}
              >
                <IconEdit /> {editNotes ? "Save" : "Edit"}
              </button>
            </div>

            {editNotes ? (
              <textarea
                style={{
                  width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--ds-border)",
                  background: "var(--ds-surface)", color: "var(--ds-text)", fontSize: 14, fontFamily: "inherit",
                  resize: "vertical"
                }}
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            ) : (
              <p style={{ margin: 0, fontSize: 15, color: "var(--ds-text2)", lineHeight: 1.6 }}>{notes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="ds-alert ds-alert-info" style={{ marginTop: 24 }}>
        <IconShield size={18} />
        <p>All patient information is encrypted and visible only to authorized caretakers.</p>
      </div>
    </CaretakerShell>
  );
}

function ProfileRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--ds-border2)" }}>
      <span style={{ fontSize: 14, color: "var(--ds-text3)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: highlight ? 700 : 500, color: highlight ? "var(--role-primary)" : "var(--ds-text)" }}>
        {value}
      </span>
    </div>
  );
}
