import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PatientSidebar } from "./pages";
import { saveActivityRecord } from "./services/activityStore";
import {
  calculateAdaptiveDifficulty,
  recordGameSession,
  getPatientEncouragementMessage,
  type DifficultyLevel,
} from "./services/adaptiveAI";
import "./design-system.css";

type Difficulty = "Easy" | "Medium" | "Hard" | "Challenge";

const difficultySettings: Record<Difficulty, number> = {
  Easy: 2,
  Medium: 4,
  Hard: 6,
  Challenge: 8,
};

const sounds = [
  { id: 1, name: "Bell", frequency: 440 },
  { id: 2, name: "Bird", frequency: 523 },
  { id: 3, name: "Piano", frequency: 659 },
  { id: 4, name: "Drum", frequency: 330 },
  { id: 5, name: "Guitar", frequency: 392 },
  { id: 6, name: "Trumpet", frequency: 587 },
  { id: 7, name: "Flute", frequency: 698 },
  { id: 8, name: "Violin", frequency: 784 },
];

export function MusicalMemory() {
  const navigate = useNavigate();

  const [aiRec, setAiRec] = useState(() => calculateAdaptiveDifficulty("musical-memory"));
  const [difficulty, setDifficulty] = useState<Difficulty>(aiRec.recommendedLevel as Difficulty);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSound, setSelectedSound] = useState<number | null>(null);
  const [message, setMessage] = useState("Press Play Sound and listen carefully!");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [replays, setReplays] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    const rec = calculateAdaptiveDifficulty("musical-memory");
    setAiRec(rec);
    if (!gameStarted) {
      setDifficulty(rec.recommendedLevel as Difficulty);
    }
  }, []);

  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  const activeSounds = sounds.slice(0, difficultySettings[difficulty]);
  const targetScore = difficultySettings[difficulty];

  const playSound = (frequency: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(audioContext.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 700);
    } catch {
      // audio fallback
    }
  };

  const startGame = () => {
    setScore(0);
    setAttempts(0);
    setSelectedSound(null);
    setSeconds(0);
    setReplays(0);
    setGameCompleted(false);
    setMessage("Press Play Sound and listen carefully!");
    setGameStarted(true);
  };

  const playRandomSound = () => {
    setReplays((prev) => prev + 1);
    const randomSound = activeSounds[Math.floor(Math.random() * activeSounds.length)];
    setSelectedSound(randomSound.id);
    setMessage("Listen carefully…");
    playSound(randomSound.frequency);
  };

  const chooseSound = (id: number) => {
    if (selectedSound === null) {
      setMessage("Press Play Sound first!");
      return;
    }

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    if (id === selectedSound) {
      const newScore = score + 1;
      setScore(newScore);
      setSelectedSound(null);

      if (newScore >= targetScore) {
        setGameCompleted(true);
        setMessage("Wonderful work!");

        const accuracy = currentAttempts > 0 ? Math.min(100, Math.round((targetScore / currentAttempts) * 100)) : 100;
        const newRec = recordGameSession({
          gameSlug: "musical-memory",
          patientId: "demo_patient",
          difficulty: (difficulty === "Challenge" ? "Hard" : difficulty) as DifficultyLevel,
          score: newScore,
          correct: newScore,
          wrong: Math.max(0, currentAttempts - newScore),
          accuracy,
          responseTime: seconds,
          hintsUsed: replays,
          completed: true,
        });
        setAiRec(newRec);

        saveActivityRecord({
          activityName: "Musical Memory",
          gameSlug: "musical-memory",
          category: "Auditory",
          completed: true,
          score: newScore,
          totalPossible: targetScore,
          accuracy,
          timeTakenSeconds: seconds,
          difficulty: (difficulty === "Challenge" ? "Hard" : difficulty) as DifficultyLevel,
          hintsUsed: replays,
          attempts: currentAttempts,
        });
      } else {
        setMessage("Correct! Wonderful job!");
      }
    } else {
      setMessage("Not quite! Listen carefully and try again.");
    }
  };

  return (
    <div className="ds-shell ds-page-enter">
      <PatientSidebar active="/play" />

      <main className="ds-main" id="main-content">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">AUDITORY MEMORY ACTIVITY</p>
          <h1 className="ds-page-title">Musical Memory</h1>
          <p className="ds-page-sub">Listen carefully and match the sound you heard.</p>
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
              <h2 style={{ margin: 0, fontSize: 22, color: "var(--ds-text)" }}>Choose Difficulty</h2>
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
                    <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 500, marginTop: 4 }}>{difficultySettings[level]} sounds</span>
                  </button>
                );
              })}
            </div>

            <button className="ds-btn-primary" style={{ width: "100%" }} onClick={startGame}>
              Start Activity →
            </button>
          </div>
        ) : gameCompleted ? (
          /* COMPLETION */
          <div className="ds-card" style={{ maxWidth: 640, textAlign: "center", padding: "36px 28px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 28, color: "var(--ds-text)" }}>Wonderful Work!</h2>
            <p style={{ margin: "0 0 24px", color: "var(--ds-text2)", fontSize: 16 }}>
              You completed the {difficulty} level in Musical Memory. SmritiSetu has saved your progress!
            </p>

            <div className="ds-stats-grid" style={{ marginBottom: 28 }}>
              <div className="ds-stat-card">
                <div className="ds-stat-value">{score}/{targetScore}</div>
                <div className="ds-stat-label">Final Score</div>
              </div>
              <div className="ds-stat-card">
                <div className="ds-stat-value">
                  {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                  {String(seconds % 60).padStart(2, "0")}
                </div>
                <div className="ds-stat-label">Time</div>
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--ds-text2)", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--ds-border2)" }}>
              <span>Progress: <strong>{score} / {targetScore}</strong></span>
              <span>Attempts: <strong>{attempts}</strong></span>
              <span>Time: <strong>
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </strong></span>
            </div>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--ds-text)", margin: "0 0 16px" }}>{message}</p>

              <button className="ds-btn-primary" style={{ minWidth: 200 }} onClick={playRandomSound}>
                Play Sound
              </button>
            </div>

            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ds-text3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, textAlign: "center" }}>
              Select the matching sound
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 14, marginBottom: 24 }}>
              {activeSounds.map((sound) => (
                <button
                  key={sound.id}
                  className="ds-btn-secondary"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 12px", minHeight: 90, borderRadius: 12 }}
                  onClick={() => chooseSound(sound.id)}
                >
                  <strong style={{ fontSize: 16, color: "var(--ds-text)" }}>{sound.name}</strong>
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <button className="ds-btn-secondary" style={{ fontSize: 13, padding: "6px 16px", minHeight: 34 }} onClick={() => setGameStarted(false)}>
                ← Change Difficulty
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}