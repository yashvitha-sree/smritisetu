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

const allQuestions = [
  {
    level: 1,
    question: "Which famous tea known worldwide for its rich aroma is grown in North East India?",
    options: ["Assam Tea", "Green Tea", "Jasmine Tea", "Herbal Tea"],
    answer: "Assam Tea",
    hint: "It comes from the lush green river valleys of Assam.",
  },
  {
    level: 1,
    question: "What utensil do you hold to drink warm tea?",
    options: ["A plate", "A cup", "A spoon", "A bowl"],
    answer: "A cup",
    hint: "It has a handle.",
  },
  {
    level: 1,
    question: "What domestic animal gives us fresh milk and says 'moo'?",
    options: ["Dog", "Cat", "Cow", "Horse"],
    answer: "Cow",
    hint: "It is a peaceful farm animal.",
  },
  {
    level: 1,
    question: "Which of these is a sweet red or green fruit?",
    options: ["Potato", "Carrot", "Apple", "Spinach"],
    answer: "Apple",
    hint: "An apple a day keeps the doctor away.",
  },
  {
    level: 2,
    question: "Which vibrant spring festival with folk dance and Pepa horns is celebrated in Assam?",
    options: ["Rongali Bihu", "Hornbill", "Wangala", "Chapchar Kut"],
    answer: "Rongali Bihu",
    hint: "It marks the Assamese New Year and spring harvest.",
  },
  {
    level: 2,
    question: "Which famous World Heritage National Park in Assam is home to the one-horned rhinoceros?",
    options: ["Kaziranga National Park", "Jim Corbett", "Gir Forest", "Sundarbans"],
    answer: "Kaziranga National Park",
    hint: "It lies along the banks of the mighty Brahmaputra river.",
  },
  {
    level: 2,
    question: "Which festival of lights is celebrated across India with diyas?",
    options: ["Holi", "Diwali", "Christmas", "Eid"],
    answer: "Diwali",
    hint: "People light lamps and share sweets.",
  },
  {
    level: 3,
    question: "Which beautiful freshwater lake in Manipur is famous for floating islands called 'Phumdis'?",
    options: ["Loktak Lake", "Dal Lake", "Chilika Lake", "Wular Lake"],
    answer: "Loktak Lake",
    hint: "It is the largest freshwater lake in North East India.",
  },
  {
    level: 3,
    question: "Which grand December festival celebrated in Nagaland is known as the 'Festival of Festivals'?",
    options: ["Hornbill Festival", "Bihu", "Losar", "Lui-Ngai-Ni"],
    answer: "Hornbill Festival",
    hint: "It takes place at the Naga Heritage Village near Kohima.",
  },
  {
    level: 4,
    question: "Which famous traditional bamboo dance is performed rhythmically in Mizoram?",
    options: ["Cheraw Dance", "Bihu Dance", "Bardo Chham", "Hojagiri"],
    answer: "Cheraw Dance",
    hint: "Dancers step gracefully between clacking bamboo staves.",
  },
  {
    level: 4,
    question: "Which state in North East India is known as the 'Land of the Dawn-Lit Mountains'?",
    options: ["Arunachal Pradesh", "Meghalaya", "Sikkim", "Tripura"],
    answer: "Arunachal Pradesh",
    hint: "It is the easternmost state of India where the sun rises first.",
  },
];

const QUESTIONS_PER_SESSION = 5;
type Difficulty = "Easy" | "Medium" | "Hard" | "Challenge";

const difficultyLevels: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Challenge: 4,
};

export default function RetroTrivia() {
  const navigate = useNavigate();

  const [aiRec, setAiRec] = useState(() => calculateAdaptiveDifficulty("retro-trivia"));
  const [difficulty, setDifficulty] = useState<Difficulty>(aiRec.recommendedLevel as Difficulty);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const [questions, setQuestions] = useState<typeof allQuestions>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const rec = calculateAdaptiveDifficulty("retro-trivia");
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
    const level = difficultyLevels[difficulty];
    const pool = allQuestions.filter((q) => q.level <= level);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selectedQ = shuffled.slice(0, QUESTIONS_PER_SESSION);

    setQuestions(selectedQ);
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setHintsUsed(0);
    setShowHint(false);
    setCorrect(0);
    setWrong(0);
    setSeconds(0);
    setTotalTime(0);
    setMessage("");
    setStartTime(Date.now());
    setGameStarted(true);
    setGameCompleted(false);
  }

  function handleAnswer(option: string) {
    if (answered) return;

    setSelected(option);
    setAnswered(true);
    setShowHint(false);

    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.answer;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setMessage("Correct! Wonderful job.");
    } else {
      setWrong((w) => w + 1);
      setMessage(`Not quite. The correct answer was: ${currentQuestion.answer}.`);
    }
  }

  function handleHint() {
    setShowHint(true);
    setHintsUsed((h) => h + 1);
  }

  async function nextQuestion() {
    setAnswered(false);
    setSelected(null);
    setShowHint(false);
    setMessage("");

    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setTotalTime(elapsed);
      setGameCompleted(true);

      const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

      // Adaptive AI Record
      const newRec = recordGameSession({
        gameSlug: "retro-trivia",
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
        activityName: "Retro Trivia",
        gameSlug: "retro-trivia",
        category: "Recall",
        completed: true,
        score: correct,
        totalPossible: questions.length,
        accuracy,
        timeTakenSeconds: elapsed,
        difficulty: (difficulty === "Challenge" ? "Hard" : difficulty) as DifficultyLevel,
        hintsUsed,
        attempts: 1,
      });

      // Backend submission
      await submitGameResult({
        game: "retro-trivia",
        score: correct,
        correct: correct,
        wrong: wrong,
        accuracy: accuracy,
        difficulty: difficultyLevels[difficulty],
        response_time: elapsed,
        hints_used: hintsUsed,
        completed: true,
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const currentQuestion = questions[currentIndex];
  const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  return (
    <div className="ds-shell ds-page-enter">
      <PatientSidebar active="/play" />

      <main className="ds-main" id="main-content">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">MEMORY RECALL ACTIVITY · NER CULTURAL TRIVIA</p>
          <h1 className="ds-page-title">Retro Trivia</h1>
          <p className="ds-page-sub">Gentle questions about familiar North Eastern cultural memories, places, and heritage.</p>
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
              {(Object.keys(difficultyLevels) as Difficulty[]).map((level) => {
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
                      {level === "Easy" && "Familiar items"}
                      {level === "Medium" && "Bihu & Kaziranga"}
                      {level === "Hard" && "Loktak & Hornbill"}
                      {level === "Challenge" && "Cheraw & NER heritage"}
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
            <h2 style={{ margin: "0 0 10px", fontSize: 28, color: "var(--ds-text)" }}>Activity Complete!</h2>
            <p style={{ margin: "0 0 24px", color: "var(--ds-text2)", fontSize: 16 }}>
              You finished Retro Trivia. Every session helps refresh your memory!
            </p>

            <div className="ds-stats-grid" style={{ marginBottom: 28 }}>
              <div className="ds-stat-card">
                <div className="ds-stat-value">{correct}/{questions.length}</div>
                <div className="ds-stat-label">Correct Answers</div>
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
              <span>Question <strong>{currentIndex + 1}</strong> of <strong>{questions.length}</strong></span>
              <span>Time: <strong>
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </strong></span>
            </div>

            <div className="ds-progress-track" style={{ marginBottom: 24 }}>
              <div className="ds-progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ds-text)", margin: "0 0 24px", lineHeight: 1.4 }}>
              {currentQuestion.question}
            </h2>

            {showHint && (
              <div className="ds-alert ds-alert-info" style={{ marginBottom: 20 }}>
                <p>Hint: {currentQuestion.hint}</p>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {currentQuestion.options.map((option) => {
                let btnStyle = "ds-btn-secondary";
                if (answered) {
                  if (option === currentQuestion.answer) btnStyle = "ds-btn-primary";
                }
                return (
                  <button
                    key={option}
                    className={btnStyle}
                    style={{
                      justifyContent: "flex-start", padding: "14px 20px", fontSize: 16, textAlign: "left", borderRadius: 10,
                      ...(answered && option === selected && option !== currentQuestion.answer ? { borderColor: "var(--ds-error)", color: "var(--ds-error)" } : {})
                    }}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                  >
                    {option}
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
              <button className="ds-btn-primary" style={{ width: "100%" }} onClick={nextQuestion}>
                {currentIndex + 1 >= questions.length ? "See Results" : "Next Question →"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
