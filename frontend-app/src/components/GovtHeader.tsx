import { useState, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import "./GovtStyles.css";

export function GovtHeader() {
  const { language, setLanguage, languages, t } = useLanguage();
  const [fontSize, setFontSize] = useState<"small" | "normal" | "large">("normal");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Apply font size and contrast to root element
    const root = document.documentElement;
    if (fontSize === "small") root.style.setProperty("--base-font-size", "14px");
    else if (fontSize === "large") root.style.setProperty("--base-font-size", "22px");
    else root.style.setProperty("--base-font-size", "18px");

    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }, [fontSize, highContrast]);

  return (
    <header className="govt-header">
      <div className="govt-header-top">
        <div className="govt-top-left">
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <span className="govt-text">🇮🇳 {t("govtMinistry")}</span>
        </div>
        <div className="govt-top-right">
          {/* Accessibility Controls */}
          <div className="access-controls">
            <button onClick={() => setFontSize("small")} aria-label="Decrease Font Size" title="Decrease Font Size">A-</button>
            <button onClick={() => setFontSize("normal")} aria-label="Normal Font Size" title="Normal Font Size">A</button>
            <button onClick={() => setFontSize("large")} aria-label="Increase Font Size" title="Increase Font Size">A+</button>
            <button 
              className={`contrast-btn ${highContrast ? "active" : ""}`}
              onClick={() => setHighContrast(!highContrast)} 
              aria-label="Toggle High Contrast"
              title="Toggle High Contrast"
            >
              🌗
            </button>
          </div>
          {/* Language Switcher */}
          <div className="lang-switcher">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              aria-label="Select Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="govt-header-main">
        <div className="emblem-container">
          <img src="/emblem.svg" alt="National Emblem of India" className="emblem" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><text x="10" y="30" font-size="20">🇮🇳</text></svg>' }} />
        </div>
        <div className="govt-titles">
          <h1>{t("appName")}</h1>
          <p className="govt-scheme">{t("govtScheme")}</p>
          <p className="app-tagline">{t("appTagline")}</p>
        </div>
      </div>
    </header>
  );
}
