import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitGameResult } from "./services/api";
import {
  calculateAdaptiveDifficulty,
  recordGameSession,
  getPatientEncouragementMessage,
  type DifficultyLevel,
} from "./services/adaptiveAI";
import { PatientSidebar } from "./pages";
import { saveActivityRecord } from "./services/activityStore";
import "./design-system.css";

const allPuzzles = [
  {
    level: 1,
    instruction: "Which one does not belong?",
    items: ["🍎", "🍊", "🍇", "🌼"],
    oddIndex: 3,
    hint: "Three of these are fruits.",
    explanation: "Daisy (🌼) is a flower, not a fruit.",
  },
  {
    level: 1,
    instruction: "Which one does not belong?",
    items: ["🐶", "🐱", "🐟", "🐮"],
    oddIndex: 2,
    hint: "Three of these live on land.",
    explanation: "Fish (🐟) lives in water, not on land.",
  },
  {
    level: 1,
    instruction: "Which color is different?",
    items: ["🔴", "🔴", "🔵", "🔴"],
    oddIndex: 2,
    hint: "Look carefully at the colors.",
    explanation: "The blue circle (🔵) is different from red.",
  },
  {
    level: 2,
    instruction: "Which one does not belong?",
    items: ["🍌", "🍇", "🥕", "🍎", "🍓", "🫐"],
    oddIndex: 2,
    hint: "Most of these are sweet fruits.",
    explanation: "Carrot (🥕) is a vegetable, not a fruit.",
  },
  {
    level: 2,
    instruction: "Which mode of transport is different?",
    items: ["✈️", "🚀", "🚁", "🚂", "🛩️", "🪂"],
    oddIndex: 3,
    hint: "Most of these travel through the air.",
    explanation: "Train (🚂) travels on ground tracks, not air.",
  },
  {
    level: 3,
    instruction: "Which shape is slightly different?",
    items: ["🌙", "🌙", "🌙", "⭐", "🌙"],
    oddIndex: 3,
    hint: "Look for a different shape.",
    explanation: "Star (⭐) is different from moon crescents.",
  },
];

type Difficulty = "Easy" | "Medium" | "Hard" | "Challenge";

const difficultySettings: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Challenge: 4,
};

const ROUNDS_PER_SESSION = 5;

export default function SpotOddOneOut() {
  const navigate = useNavigate();

  const [aiRec, setAiRec] = useState(() => calculateAdaptiveDifficulty("spot-odd-one-out"));
  const [difficulty, setDifficulty] = useState<Difficulty>(aiRec.recommendedLevel as Difficulty);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const [puzzles, setPuzzles] = useState<typeof allPuzzles>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [, setTotalTime] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const rec = calculateAdaptiveDifficulty("spot-odd-one-out");
    setAiRec(rec);
    if (!gameStarted) {
      setDifficulty(rec.recommendedLevel as Difficulty);
    }
  }, []);

  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  function startGame() {
    const level = difficultySettings[difficulty];
    const pool = allPuzzles.filter((p) => p.level <= level);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selectedP = shuffled.slice(0, ROUNDS_PER_SESSION);

    setPuzzles(selectedP);
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setShowHint(false);
    setHintsUsed(0);
    setCorrect(0);
    setWrong(0);
    setSeconds(0);
    setTotalTime(0);
    setMessage("");
    setStartTime(Date.now());
    setGameStarted(true);
    setGameCompleted(false);
  }

  function handleSelect(index: number) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    setShowHint(false);

    const puzzle = puzzles[currentIndex];
    if (index === puzzle.oddIndex) {
      setCorrect((c) => c + 1);
      setMessage(`Correct! ${puzzle.explanation}`);
    } else {
      setWrong((w) => w + 1);
      setMessage(`Not quite. ${puzzle.explanation}`);
    }
  }

  function handleHint() {
    setShowHint(true);
    setHintsUsed((h) => h + 1);
  }

  async function nextRound() {
    setAnswered(false);
    setSelected(null);
    setShowHint(false);
    setMessage("");

    if (currentIndex + 1 >= puzzles.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setTotalTime(elapsed);
      setGameCompleted(true);

      const accuracy = puzzles.length > 0 ? Math.round((correct / puzzles.length) * 100) : 0;

      const newRec = recordGameSession({
        gameSlug: "spot-odd-one-out",
        patientId: "demo_patient",
        difficulty: (difficulty === "Challenge" ? "Hard" : difficulty) as DifficultyLevel,
        score: correct,
        correct: correct,
        wrong: wrong,
        accuracy,
        responseTime: elapsed,
        hintsUsed,
        completed: true,
      });
      setAiRec(newRec);

      saveActivityRecord({
        activityName: "Spot the Odd One",
        gameSlug: "spot-odd-one-out",
        category: "Attention",
        completed: true,
        score: correct,
        totalPossible: puzzles.length,
        accuracy,
        timeTakenSeconds: elapsed,
        difficulty: (difficulty === "Challenge" ? "Hard" : difficulty) as DifficultyLevel,
        hintsUsed,
        attempts: 1,
      });

      await submitGameResult({
        game: "spot-odd-one-out",
        score: correct,
        correct: correct,
        wrong: wrong,
        accuracy: accuracy,
        difficulty: difficultySettings[difficulty],
        response_time: elapsed,
        hints_used: hintsUsed,
        completed: true,
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const currentPuzzle = puzzles[currentIndex];
  const accuracy = puzzles.length > 0 ? Math.round((correct / puzzles.length) * 100) : 0;

  return (
    <div className="ds-shell ds-page-enter">
      <PatientSidebar active="/play" />

      <main className="ds-main" id="main-content">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">ATTENTION &amp; OBSERVATION ACTIVITY</p>
          <h1 className="ds-page-title">Spot the Odd One</h1>
          <p className="ds-page-sub">Look closely at the items and find the one that is different.</p>
        </div>

        <div className="ds-alert ds-alert-info" style={{ marginBottom: 24, maxWidth: 640 }}>
          <span style={{ fontSize: 18 }}>🧠</span>
          <div>
            <strong style={{ color: "var(--role-primary)", fontSize: 14 }}>AI Adaptive Recommendation:</strong>
            <p style={{ margin: "2px 0 0", fontSize: 14 }}>{getPatientEncouragementMessage(aiRec)}</p>
          </div>
        </div>

        {!gameStarted ? (
          /* DIFFICULTY SELECTION */
          <div className="ds-card ds-card-accent" style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, color: "var(--ds-text)" }}>Choose Level</h2>
              <span className="ds-badge ds-badge-primary">AI Suggested: {aiRec.recommendedLevel}</span>
            </div>
            <p style={{ margin: "0 0 24px", color: "var(--ds-text2)", fontSize: 15 }}>Pick a level that feels comfortable for you.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              {(Object.keys(difficultySettings) as Difficulty[]).map((level) => {
                const isRec = aiRec.recommendedLevel === level;
                return (
                  <button
                    key={level}
                    className={difficulty === level ? "ds-btn-primary" : "ds-btn-secondary"}
                    style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "16px 20px", height: "auto", borderRadius: 12 }}
                    onClick={() => setDifficulty(level)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <strong style={{ fontSize: 16 }}>{level}</strong>
                      {isRec && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.25)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>★ AI Choice</span>}
                    </div>
                    <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 500, marginTop: 4 }}>
                      {level === "Easy" && "3–4 items"}
                      {level === "Medium" && "5–6 items"}
                      {level === "Hard" && "Similar items"}
                      {level === "Challenge" && "Subtle differences"}
                    </span>
                  </button>
                );
              })}
            </div>

            <button className="ds-btn-primary" style={{ width: "100%" }} onClick={startGame}>
              Start Activity →
            </button>
          </div>
        ) : gameCompleted ? (
          /* GAME COMPLETE */
          <div className="ds-card" style={{ maxWidth: 640, textAlign: "center", padding: "36px 28px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 28, color: "var(--ds-text)" }}>Wonderful Work!</h2>
            <p style={{ margin: "0 0 24px", color: "var(--ds-text2)", fontSize: 16 }}>
              You completed Spot the Odd One. Great observation skills!
            </p>

            <div className="ds-stats-grid" style={{ marginBottom: 28 }}>
              <div className="ds-stat-card">
                <div className="ds-stat-value">{correct}/{puzzles.length}</div>
                <div className="ds-stat-label">Correct Rounds</div>
              </div>
              <div className="ds-stat-card">
                <div className="ds-stat-value">{accuracy}%</div>
                <div className="ds-stat-label">Accuracy</div>
              </div>
              <div className="ds-stat-card">
                <div className="ds-stat-value" style={{ color: "var(--role-primary)" }}>{aiRec.recommendedLevel}</div>
                <div className="ds-stat-label">Next AI Level</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="ds-btn-primary" onClick={startGame}>
                Play Again
              </button>
              <button className="ds-btn-secondary" onClick={() => navigate("/play")}>
                Back to Activities
              </button>
            </div>
          </div>
        ) : (
          /* GAME IN PROGRESS */
          <div className="ds-card" style={{ maxWidth: 640, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--ds-text2)", marginBottom: 16 }}>
              <span>Round <strong>{currentIndex + 1}</strong> of <strong>{puzzles.length}</strong></span>
              <span>Time: <strong>
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </strong></span>
            </div>

            <div className="ds-progress-track" style={{ marginBottom: 24 }}>
              <div className="ds-progress-fill" style={{ width: `${((currentIndex + 1) / puzzles.length) * 100}%` }} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ds-text)", margin: "0 0 20px" }}>
              {currentPuzzle.instruction}
            </h2>

            {showHint && (
              <div className="ds-alert ds-alert-info" style={{ marginBottom: 20 }}>
                <p>Hint: {currentPuzzle.hint}</p>
              </div>
            )}

            {!answered && !showHint && (
              <button
                className="ds-btn-secondary"
                style={{ fontSize: 13, padding: "6px 14px", minHeight: 34, marginBottom: 20 }}
                onClick={handleHint}
              >
                Show Hint
              </button>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 16, marginBottom: 24 }}>
              {currentPuzzle.items.map((item, index) => {
                let borderStyle = "1px solid var(--ds-border)";
                let bgStyle = "var(--ds-surface)";
                if (answered) {
                  if (index === currentPuzzle.oddIndex) {
                    borderStyle = "3px solid var(--ds-success)";
                    bgStyle = "var(--role-primary-light)";
                  } else if (index === selected) {
                    borderStyle = "3px solid var(--ds-error)";
                  }
                }
                return (
                  <button
                    key={index}
                    style={{
                      aspectRatio: "1/1", fontSize: 36, borderRadius: 14, border: borderStyle, background: bgStyle,
                      cursor: answered ? "default" : "pointer", boxShadow: "var(--ds-shadow-sm)", transition: "all 0.2s"
                    }}
                    onClick={() => handleSelect(index)}
                    disabled={answered}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {message && (
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ds-text)", margin: "0 0 20px" }}>
                {message}
              </p>
            )}

            {answered && (
              <button className="ds-btn-primary" style={{ width: "100%" }} onClick={nextRound}>
                {currentIndex + 1 >= puzzles.length ? "See Results" : "Next Round →"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
