/**
 * GovtTopBar.tsx — Global Government Utility Top Bar
 * Rendered at the top of all pages (Login, Patient, Caretaker).
 * Provides font size scaling (A-/A/A+), Dark Mode toggle, and Language Selector for 7 NER languages.
 * Persists language and theme globally in localStorage.
 */
import { useState, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";

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

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

type FontSize = "small" | "normal" | "large";
type Theme    = "light" | "dark";

import {
  getStoredFontSize,
  setGlobalFontSize,
  subscribeFontSize,
  type FontSize,
} from "../services/fontSizeStore";

export function GovtTopBar() {
  const { language, setLanguage, languages } = useLanguage();

  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem("cognicare_theme") as Theme) ?? "light"
  );

  const [fontSize, setFontSizeState] = useState<FontSize>(() => getStoredFontSize());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
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

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <div
      style={{
        background: "var(--ds-navy2, #0f2347)",
        color: "#fff",
        padding: "6px 24px",
        fontSize: "13px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        zIndex: 100,
        position: "relative"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <a href="#main-content" style={{ color: "#fff", textDecoration: "underline", fontSize: "12px" }}>
          Skip to main content
        </a>
        <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
          🇮🇳 Ministry of Health &amp; Family Welfare | Government of India
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        {/* Font size control */}
        <div style={{ display: "flex", gap: "3px", borderRight: "1px solid rgba(255,255,255,0.2)", paddingRight: "10px" }} role="group" aria-label="Font size controls">
          {(["small", "normal", "large"] as FontSize[]).map((size, idx) => (
            <button
              key={size}
              onClick={() => handleFontSizeChange(size)}
              style={{
                background: fontSize === size ? "var(--ds-saffron, #e8751a)" : "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
              }}
              aria-label={`${size} text size`}
              aria-pressed={fontSize === size}
            >
              {idx === 0 ? "A−" : idx === 1 ? "A" : "A+"}
            </button>
          ))}
        </div>

        {/* Dark Mode toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "5px",
            padding: "3px 10px",
            color: "#fff",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>

        {/* Global Language Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <GlobeIcon />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "5px",
              padding: "3px 10px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              outline: "none",
            }}
            aria-label="Select global language"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code} style={{ background: "#0f2347", color: "#fff" }}>
                {l.nativeLabel}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
