/**
 * LoginPage.tsx — Cognicare SIH 2026
 * Government of India Healthcare Portal Style
 * Professional, accessible, no decorative emojis
 * Full dark mode via data-theme="dark" on <html>
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./i18n/LanguageContext";
import {
  getStoredFontSize,
  setGlobalFontSize,
  subscribeFontSize,
  type FontSize,
} from "./services/fontSizeStore";
import "./login.css";

// ─────────────────────────────────────────────────────────────
// SVG Icons — inline, professional, no emojis
// ─────────────────────────────────────────────────────────────

function PatientIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function CaretakerIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="lp-btn-arrow" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="lp-disclaimer-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function HeartPulseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="lp-feat-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

// Ashok Chakra — simplified SVG (24 spokes wheel)
function AshokChakra() {
  const spokes = Array.from({ length: 24 }, (_, i) => i);
  const r = 18; // radius for spoke tips
  const cx = 24, cy = 24;
  return (
    <svg className="lp-ashok-chakra" viewBox="0 0 48 48" aria-label="Ashok Chakra">
      <circle cx={cx} cy={cy} r={20} fill="#fff" stroke="#003399" strokeWidth="2.5"/>
      <circle cx={cx} cy={cy} r={5} fill="#003399"/>
      {spokes.map(i => {
        const angle = (i * 360 / 24) * Math.PI / 180;
        const x2 = cx + r * Math.sin(angle);
        const y2 = cy - r * Math.cos(angle);
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={x2} y2={y2}
            stroke="#003399" strokeWidth="1.2"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={20} fill="none" stroke="#003399" strokeWidth="2.5"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type FontSize = "small" | "normal" | "large";
type Theme    = "light" | "dark";

// ─────────────────────────────────────────────────────────────
// Offline hook
// ─────────────────────────────────────────────────────────────

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline  = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    const goOffline = () => { setIsOnline(false); setShowBanner(true); };
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return { isOnline, showBanner };
}

// ═════════════════════════════════════════════════════════════
// LOGIN PAGE COMPONENT
// ═════════════════════════════════════════════════════════════

export function LoginPage() {
  const navigate = useNavigate();
  const { language, setLanguage, languages, t } = useLanguage();
  const { isOnline, showBanner } = useOnlineStatus();

  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem("cognicare_theme") as Theme) ?? "light"
  );

  const [fontSize, setFontSizeState] = useState<FontSize>(() => getStoredFontSize());

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    localStorage.setItem("cognicare_theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = subscribeFontSize((size) => setFontSizeState(size));
    return unsubscribe;
  }, []);

  const handleFontSizeChange = (size: FontSize) => {
    setFontSizeState(size);
    setGlobalFontSize(size);
  };

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  const GOV_SCHEME   = "NE India Cognitive Health Initiative — Smart India Hackathon 2026";
  const GOV_MINISTRY = "Ministry of Health & Family Welfare | Government of India";

  // ── Patient features (icon + text pairs) ─────────────────
  const patientFeatures = [
    t("patientFeature1"),
    t("patientFeature2"),
    t("patientFeature3"),
    t("patientFeature4"),
  ];

  const caretakerFeatures = [
    t("caretakerFeature1"),
    t("caretakerFeature2"),
    t("caretakerFeature3"),
    t("caretakerFeature4"),
  ];

  return (
    <>
      {/* ══════════════════════════════════════════
          GOVERNMENT HEADER
      ══════════════════════════════════════════ */}
      <header className="lp-govt-header" role="banner">

        {/* Top utility bar */}
        <div className="lp-govt-top">
          <div className="lp-govt-top-left">
            <a href="#lp-main" className="lp-skip-link">Skip to main content</a>
            <span className="lp-govt-text">🇮🇳 &nbsp;{GOV_MINISTRY}</span>
          </div>

          <div className="lp-govt-top-right">

            {/* Accessibility: font size */}
            <div className="lp-access-bar" role="group" aria-label="Adjust text size">
              {(["small", "normal", "large"] as FontSize[]).map((size, idx) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={fontSize === size ? "lp-active" : ""}
                  aria-label={`${size} text`}
                  aria-pressed={fontSize === size}
                >
                  {idx === 0 ? "A−" : idx === 1 ? "A" : "A+"}
                </button>
              ))}
            </div>

            {/* Dark / Light toggle */}
            <button
              className="lp-theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>

            {/* Language */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <GlobeIcon size={13} />
              <select
                className="lp-lang-select"
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                aria-label="Select language"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main identity banner */}
        <div className="lp-govt-main">
          {/* National Emblem — Ashok Chakra */}
          <div className="lp-emblem" aria-label="National Emblem of India">
            <AshokChakra />
          </div>

          <div className="lp-govt-brand">
            <h1 className="lp-govt-name">SmritiSetu</h1>
            <p className="lp-govt-scheme">{GOV_SCHEME}</p>
            <p className="lp-govt-tagline">
              AI-Based Cognitive Gaming &amp; Memory Assistance Platform for NER
            </p>
          </div>

          {/* Digital India badge */}
          <div className="lp-di-badge" aria-label="Digital India Initiative">
            <svg className="lp-ashok-chakra" viewBox="0 0 48 30" aria-hidden="true">
              <text x="0" y="16" fontFamily="Arial" fontWeight="bold"
                fontSize="11" fill="#FF9933">Digital</text>
              <text x="0" y="28" fontFamily="Arial" fontWeight="bold"
                fontSize="11" fill="#fff">India</text>
            </svg>
            <span className="lp-di-text">INITIATIVE</span>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          PAGE BODY
      ══════════════════════════════════════════ */}
      <div className="lp-root" id="lp-main" role="main">
        <main className="lp-main" aria-labelledby="lp-welcome-title">

          {/* Section label */}
          <div className="lp-section-label" aria-hidden="true">
            <span className="lp-section-label-dot" />
            Role Selection
          </div>

          {/* Welcome heading */}
          <section className="lp-welcome">
            <h2 className="lp-welcome-title" id="lp-welcome-title">
              {t("welcomeTitle")}
            </h2>
            <p className="lp-welcome-sub">
              Supporting memory, independence, and care.
            </p>
            <p className="lp-welcome-instruction">
              Please select how you would like to continue.
            </p>
          </section>

          {/* Decorative divider */}
          <div className="lp-divider" aria-hidden="true">
            <div className="lp-divider-line" />
            <div className="lp-divider-icon">
              <HeartPulseIcon size={16} />
            </div>
            <div className="lp-divider-line" />
          </div>

          {/* ── Role Cards ── */}
          <div className="lp-cards" role="region" aria-label="Role selection">

            {/* PATIENT CARD */}
            <article className="lp-card lp-card-patient">
              <div className="lp-card-icon lp-icon-patient">
                <PatientIcon size={36} />
              </div>

              <span className="lp-role-label lp-role-patient">
                Patient
              </span>

              <h3 className="lp-card-title">{t("iAmPatient")}</h3>
              <p className="lp-card-desc">
                Access cognitive games, memory activities, daily reminders,
                and personalised support — all designed for comfort and ease.
              </p>

              <ul className="lp-features" aria-label="Patient features">
                {patientFeatures.map((f, i) => (
                  <li key={i}>
                    <CheckCircleIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="lp-btn lp-btn-patient"
                onClick={() => navigate("/patient")}
                id="patient-login-btn"
                aria-label="Continue to Patient interface"
              >
                {t("continueAsPatient")}
                <ArrowRightIcon />
              </button>
            </article>

            {/* CARETAKER CARD */}
            <article className="lp-card lp-card-caretaker">
              <div className="lp-card-icon lp-icon-caretaker">
                <CaretakerIcon size={36} />
              </div>

              <span className="lp-role-label lp-role-caretaker">
                Caretaker
              </span>

              <h3 className="lp-card-title">{t("iAmCaretaker")}</h3>
              <p className="lp-card-desc">
                Monitor and support your loved one's activities, progress,
                reminders, and overall wellbeing from a dedicated dashboard.
              </p>

              <ul className="lp-features" aria-label="Caretaker features">
                {caretakerFeatures.map((f, i) => (
                  <li key={i}>
                    <CheckCircleIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="lp-btn lp-btn-caretaker"
                onClick={() => navigate("/caretaker")}
                id="caretaker-login-btn"
                aria-label="Continue to Caretaker interface"
              >
                {t("continueAsCaretaker")}
                <ArrowRightIcon />
              </button>
            </article>
          </div>

          {/* Disclaimer */}
          <aside className="lp-disclaimer" role="note" aria-label="Medical disclaimer">
            <ShieldIcon />
            <div>
              <p className="lp-disclaimer-title">Medical Disclaimer</p>
              <p className="lp-disclaimer-text">
                {t("disclaimer")} Always consult a qualified healthcare
                professional for medical advice and diagnosis.
              </p>
            </div>
          </aside>

        </main>
      </div>

      {/* ══════════════════════════════════════════
          GOVERNMENT FOOTER
      ══════════════════════════════════════════ */}
      <footer className="lp-footer" role="contentinfo">
        <div className="lp-footer-grid">
          <div className="lp-footer-section">
            <h3>SmritiSetu</h3>
            <p>{GOV_SCHEME}</p>
            <p>{GOV_MINISTRY}</p>
            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>
              Smart India Hackathon 2026 — Prototype
            </p>
          </div>

          <div className="lp-footer-section">
            <h4>Important Links</h4>
            <ul>
              <li>
                <a href="https://nhp.gov.in" target="_blank" rel="noopener noreferrer">
                  National Health Portal
                </a>
              </li>
              <li>
                <a href="https://mohfw.gov.in" target="_blank" rel="noopener noreferrer">
                  Ministry of Health &amp; FW
                </a>
              </li>
              <li>
                <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer">
                  Digital India
                </a>
              </li>
              <li>
                <a href="https://sih.gov.in" target="_blank" rel="noopener noreferrer">
                  Smart India Hackathon
                </a>
              </li>
            </ul>
          </div>

          <div className="lp-footer-section">
            <h4>Helpline &amp; Support</h4>
            <p>Toll-Free Helpline</p>
            <p className="lp-footer-helpline">14499</p>
            <p style={{ marginTop: 8 }}>support@smritisetu.gov.in</p>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© 2026 Government of India. All rights reserved.</span>
          <span>Smart India Hackathon 2026 — NER Cognitive Health Initiative</span>
        </div>
      </footer>

      {/* Offline / Online banner */}
      {showBanner && (
        <div
          className={`lp-offline-banner ${isOnline ? "online" : "offline"}`}
          role="status"
          aria-live="polite"
        >
          {isOnline
            ? "Connection restored. Your data will sync automatically."
            : "You are offline. The app continues to work. Data will sync when reconnected."
          }
        </div>
      )}
    </>
  );
}

export default LoginPage;
