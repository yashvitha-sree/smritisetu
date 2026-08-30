/**
 * fontSizeStore.ts — Global Font Size Accessibility Controller for SmritiSetu
 * -------------------------------------------------------------------------
 * Manages accessibility text scaling (A−, A, A+) globally across all screens.
 *
 * Font Size Tiers:
 *   - small  (A−): Base 14px, Scale 0.85  (Decreased text size)
 *   - normal (A) : Base 17px, Scale 1.00  (Default comfortable size)
 *   - large  (A+): Base 21px, Scale 1.25  (Increased text size for elderly users)
 *
 * Persists in localStorage ("smritisetu_font") and updates CSS variables in real-time.
 */

export type FontSize = "small" | "normal" | "large";

const STORAGE_KEY = "smritisetu_font";
const LEGACY_KEY  = "cognicare_font";

interface FontConfig {
  base: string;
  scale: string;
}

const FONT_CONFIGS: Record<FontSize, FontConfig> = {
  small:  { base: "14px", scale: "0.85" },
  normal: { base: "17px", scale: "1.00" },
  large:  { base: "21px", scale: "1.25" },
};

/** Get stored font size or default to "normal" */
export function getStoredFontSize(): FontSize {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (stored === "small" || stored === "normal" || stored === "large") {
      return stored as FontSize;
    }
  } catch (e) {
    console.error("Failed to read stored font size:", e);
  }
  return "normal";
}

/** Apply selected font size globally to documentElement */
export function setGlobalFontSize(size: FontSize): void {
  const config = FONT_CONFIGS[size] || FONT_CONFIGS.normal;
  const html = document.documentElement;

  // Apply to root html element
  html.style.fontSize = config.base;
  html.style.setProperty("--base-font-size", config.base);
  html.style.setProperty("--font-scale", config.scale);
  html.setAttribute("data-font-size", size);

  // Save preference
  try {
    localStorage.setItem(STORAGE_KEY, size);
    localStorage.setItem(LEGACY_KEY, size);
  } catch (e) {
    console.error("Failed to save font size preference:", e);
  }

  // Notify active components (GovtTopBar, LoginPage, etc.)
  window.dispatchEvent(new CustomEvent("smritisetu_font_change", { detail: size }));
  console.log(`🔤 Accessibility Font Size set to: ${size} (${config.base}, scale ${config.scale})`);
}

/** Subscribe to global font size changes */
export function subscribeFontSize(callback: (size: FontSize) => void): () => void {
  const handler = (event: Event) => {
    const customEvt = event as CustomEvent<FontSize>;
    if (customEvt.detail) {
      callback(customEvt.detail);
    }
  };

  window.addEventListener("smritisetu_font_change", handler);
  return () => {
    window.removeEventListener("smritisetu_font_change", handler);
  };
}

// Auto-initialize on module import
setGlobalFontSize(getStoredFontSize());
