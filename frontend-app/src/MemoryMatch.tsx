import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitGameResult } from "./services/api";
import { saveActivityRecord } from "./services/activityStore";
import {
  calculateAdaptiveDifficulty,
  recordGameSession,
  getPatientEncouragementMessage,
  type DifficultyLevel,
} from "./services/adaptiveAI";
import { PatientSidebar } from "./pages";
import "./design-system.css";

type Difficulty = "Easy" | "Medium" | "Hard" | "Challenge";

const difficultySettings: Record<
  Difficulty,
  { pairs: number; label: string }
> = {
  Easy: { pairs: 2, label: "2 pairs" },
  Medium: { pairs: 4, label: "4 pairs" },
  Hard: { pairs: 6, label: "6 pairs" },
  Challenge: { pairs: 8, label: "8 pairs" },
};

const allIcons = ["🍎", "🌸", "🐶", "⭐", "🍀", "🚗", "🎈", "🌻"];

function createCards(difficulty: Difficulty) {
  const numberOfPairs = difficultySettings[difficulty].pairs;
  const selectedIcons = allIcons.slice(0, numberOfPairs);

  return [...selectedIcons, ...selectedIcons]
    .sort(() => Math.random() - 0.5)
    .map((icon, index) => ({
      id: index,
      icon,
      matched: false,
    }));
}

export default function MemoryMatch() {
  const navigate = useNavigate();

  const [aiRec, setAiRec] = useState(() => calculateAdaptiveDifficulty("memory-match"));
  const [difficulty, setDifficulty] = useState<Difficulty>(aiRec.recommendedLevel as Difficulty);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const [gameCards, setGameCards] = useState<
    { id: number; icon: string; matched: boolean }[]
  >([]);

  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hintsUsed] = useState(0);

  useEffect(() => {
    const rec = calculateAdaptiveDifficulty("memory-match");
    setAiRec(rec);
    if (!gameStarted) {
      setDifficulty(rec.recommendedLevel as Difficulty);
    }
  }, []);

  useEffect(() => {
    if (
      gameStarted &&
      gameCards.length > 0 &&
      gameCards.every((card) => card.matched) &&
      !gameCompleted
    ) {
      setGameCompleted(true);
      const pairs = difficultySettings[difficulty].pairs;
      const accuracy = moves > 0 ? Math.min(100, Math.round((pairs / moves) * 100)) : 100;

      // 1. Record session in Adaptive AI engine
      const newRec = recordGameSession({
        gameSlug: "memory-match",
        patientId: "demo_patient",
        difficulty: (difficulty === "Challenge" ? "Hard" : difficulty) as DifficultyLevel,
        score: pairs,
        correct: pairs,
        wrong: Math.max(0, moves - pairs),
        accuracy,
        responseTime: seconds,
        hintsUsed,
        completed: true,
      });
      setAiRec(newRec);

      // 2. Save to Centralized Activity Store
      saveActivityRecord({
        activityName: "Memory Match",
        gameSlug: "memory-match",
        category: "Memory",
        completed: true,
        score: pairs,
        totalPossible: pairs,
        accuracy,
        timeTakenSeconds: seconds,
        difficulty: (difficulty === "Challenge" ? "Hard" : difficulty) as DifficultyLevel,
        hintsUsed,
        attempts: 1,
      });

      // 3. Submit to backend API
      submitGameResult({
        game: "memory-match",
        score: pairs,
        correct: pairs,
        wrong: Math.max(0, moves - pairs),
        accuracy,
        difficulty: Object.keys(difficultySettings).indexOf(difficulty) + 1,
        response_time: seconds,
        hints_used: hintsUsed,
        completed: true,
      });
    }
  }, [gameCards, gameStarted, gameCompleted]);

  const startGame = () => {
    setGameCards(createCards(difficulty));
    setFlippedCards([]);
    setMoves(0);
    setSeconds(0);
    setGameCompleted(false);
    setGameStarted(true);
  };

  const handleCardClick = (index: number) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(index) ||
      gameCards[index].matched
    ) {
      return;
    }

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);

      const firstCard = gameCards[newFlipped[0]];
      const secondCard = gameCards[newFlipped[1]];

      if (firstCard.icon === secondCard.icon) {
        setGameCards((prevCards) =>
          prevCards.map((card, i) =>
            newFlipped.includes(i) ? { ...card, matched: true } : card
          )
        );
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  return (
    <div className="ds-shell ds-page-enter">
      <PatientSidebar active="/play" />

      <main className="ds-main" id="main-content">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">MEMORY ACTIVITY</p>
          <h1 className="ds-page-title">Memory Match</h1>
          <p className="ds-page-sub">Find the matching pairs. Take your time — there is no rush.</p>
        </div>

        {/* Supportive AI Personalization Banner */}
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
              <h2 style={{ margin: 0, fontSize: 22, color: "var(--ds-text)" }}>Choose Difficulty</h2>
              <span className="ds-badge ds-badge-primary">
                AI Suggested: {aiRec.recommendedLevel}
              </span>
            </div>
            <p style={{ margin: "0 0 24px", color: "var(--ds-text2)", fontSize: 15 }}>
              Pick a level that feels comfortable for you.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              {(Object.keys(difficultySettings) as Difficulty[]).map((level) => {
                const isRec = aiRec.recommendedLevel === level;
                return (
                  <button
                    key={level}
                    className={difficulty === level ? "ds-btn-primary" : "ds-btn-secondary"}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start",
                      padding: "16px 20px", height: "auto", textTransform: "none", borderRadius: 12,
                      position: "relative"
                    }}
                    onClick={() => setDifficulty(level)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <strong style={{ fontSize: 16 }}>{level}</strong>
                      {isRec && (
                        <span style={{ fontSize: 11, background: "rgba(255,255,255,0.25)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          ★ AI Choice
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 500, marginTop: 4 }}>
                      {difficultySettings[level].label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button className="ds-btn-primary" style={{ width: "100%" }} onClick={startGame}>
              Start Activity →
            </button>
          </div>
        ) : (
          /* GAME IN PROGRESS OR COMPLETE */
          <div className="ds-card" style={{ maxWidth: 680 }}>
            {gameCompleted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 28, color: "var(--ds-text)" }}>Wonderful Work!</h2>
                <p style={{ margin: "0 0 24px", color: "var(--ds-text2)", fontSize: 16 }}>
                  You completed Memory Match. SmritiSetu has analyzed your session to personalize future activities!
                </p>

                <div className="ds-stats-grid" style={{ marginBottom: 28 }}>
                  <div className="ds-stat-card">
                    <div className="ds-stat-value">{moves}</div>
                    <div className="ds-stat-label">Moves Taken</div>
                  </div>
                  <div className="ds-stat-card">
                    <div className="ds-stat-value">
                      {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                      {String(seconds % 60).padStart(2, "0")}
                    </div>
                    <div className="ds-stat-label">Total Time</div>
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
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--ds-border2)" }}>
                  <div style={{ fontSize: 15, color: "var(--ds-text2)" }}>
                    Level: <strong>{difficulty}</strong> &nbsp;•&nbsp; Moves: <strong>{moves}</strong> &nbsp;•&nbsp; Time: <strong>
                      {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                      {String(seconds % 60).padStart(2, "0")}
                    </strong>
                  </div>
                  <button className="ds-btn-secondary" style={{ padding: "6px 14px", minHeight: 36, fontSize: 13 }} onClick={startGame}>
                    Restart
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${difficultySettings[difficulty].pairs > 4 ? 4 : difficultySettings[difficulty].pairs}, 1fr)`,
                    gap: 16,
                    maxWidth: 540,
                    margin: "0 auto 20px"
                  }}
                >
                  {gameCards.map((card, index) => {
                    const isFlipped = flippedCards.includes(index) || card.matched;

                    return (
                      <button
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        style={{
                          aspectRatio: "1/1",
                          borderRadius: 14,
                          fontSize: isFlipped ? 36 : 22,
                          fontWeight: 700,
                          cursor: card.matched ? "default" : "pointer",
                          background: card.matched
                            ? "var(--ds-surface2)"
                            : isFlipped
                            ? "var(--role-primary-light)"
                            : "var(--role-primary)",
                          color: isFlipped ? "var(--role-primary)" : "#fff",
                          border: card.matched
                            ? "2px solid var(--ds-success)"
                            : "2px solid var(--ds-border)",
                          boxShadow: "var(--ds-shadow-sm)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {isFlipped ? card.icon : "?"}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}