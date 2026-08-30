/**
 * CaretakerLayout.tsx
 * Shared sidebar + layout shell for all caretaker pages.
 * Role theme: Green (#1a7a5e)
 * Includes global GovtTopBar with 7 NER language selector & accessibility controls.
 */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { GovtTopBar } from "../components/GovtTopBar";
import "../design-system.css";

// SVG Line Icons for Caretaker Navigation
function IconDashboard({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1"/>
      <rect x="14" y="3" width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/>
      <rect x="3" y="16" width="7" height="5" rx="1"/>
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

function IconBell({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function IconUser({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
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

export function CaretakerSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const active    = location.pathname;
  const { t }     = useLanguage();

  const NAV_ITEMS = [
    { path: "/caretaker",            icon: <IconDashboard />, label: t("navDashboard")        },
    { path: "/caretaker/activity",   icon: <IconActivity />,  label: t("caretakerFeature1")   },
    { path: "/caretaker/reminders",  icon: <IconBell />,      label: t("navReminders")        },
    { path: "/caretaker/profile",    icon: <IconUser />,      label: t("navProfile")          },
  ];

  return (
    <aside className="ds-sidebar">
      <div>
        <span className="ds-logo" onClick={() => navigate("/caretaker")} role="link" tabIndex={0}>
          SmritiSetu
        </span>
        <div className="ds-role-chip">{t("iAmCaretaker")}</div>

        <nav className="ds-nav" aria-label="Caretaker navigation">
          {NAV_ITEMS.map((item) => (
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
        <button
          className="ds-logout-btn"
          onClick={() => navigate("/")}
        >
          <IconLogOut />
          {t("navLogout")}
        </button>
        <p className="ds-sidebar-note">
          Supporting your loved one's memory and wellbeing, one day at a time.
        </p>
      </div>
    </aside>
  );
}

/** Wrap every caretaker page in this layout with green theme override */
export function CaretakerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="caretaker-theme" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <GovtTopBar />
      <div className="ds-shell ds-page-enter" style={{ flex: 1 }}>
        <CaretakerSidebar />
        <main className="ds-main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
