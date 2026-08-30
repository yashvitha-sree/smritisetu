import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// ── Games ──────────────────────────────────────────────
import MemoryMatch   from "./MemoryMatch";
import { MusicalMemory } from "./MusicalMemory";
import { WordSearch }    from "./WordSearch";
import RetroTrivia   from "./RetroTrivia";
import SpotOddOneOut from "./SpotOddOneOut";

// ── Patient pages ──────────────────────────────────────
import {
  HomePage,
  GamesPage,
  RemindersPage,
  ActivityPage,
  VoicePage,
} from "./pages";

// ── Login (new dedicated file) ─────────────────────────
import LoginPage from "./LoginPage";

// ── Caretaker pages (new dedicated files) ─────────────
import CaretakerDashboard from "./caretaker/CaretakerDashboard";
import CaretakerActivity  from "./caretaker/CaretakerActivity";
import CaretakerReminders from "./caretaker/CaretakerReminders";
import CaretakerProfile   from "./caretaker/CaretakerProfile";

// ── Backend init ───────────────────────────────────────
import { initializeApp } from "./services/api";

function App() {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <Routes>
      {/* ── Landing / Role Selection ── */}
      <Route path="/" element={<LoginPage />} />

      {/* ── Patient ── */}
      <Route path="/patient"        element={<HomePage />} />
      <Route path="/play"           element={<GamesPage />} />
      <Route path="/memory-match"   element={<MemoryMatch />} />
      <Route path="/musical-memory" element={<MusicalMemory />} />
      <Route path="/word-search"    element={<WordSearch />} />
      <Route path="/retro-trivia"   element={<RetroTrivia />} />
      <Route path="/spot-odd-one-out" element={<SpotOddOneOut />} />
      <Route path="/reminders"      element={<RemindersPage />} />
      <Route path="/activity"       element={<ActivityPage />} />
      <Route path="/voice"          element={<VoicePage />} />

      {/* ── Caretaker ── */}
      <Route path="/caretaker"            element={<CaretakerDashboard />} />
      <Route path="/caretaker/activity"   element={<CaretakerActivity />} />
      <Route path="/caretaker/reminders"  element={<CaretakerReminders />} />
      <Route path="/caretaker/profile"    element={<CaretakerProfile />} />
    </Routes>
  );
}

export default App;