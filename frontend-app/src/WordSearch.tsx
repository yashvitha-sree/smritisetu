import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PatientSidebar } from "./pages";
import { saveActivityRecord } from "./services/activityStore";
import {
  calculateAdaptiveDifficulty,
  recordGameSession,
  getPatientEncouragementMessage,
} from "./services/adaptiveAI";
import "./design-system.css";

const grid = [
  ["C", "A", "T", "X", "Q", "D", "O", "G"],
  ["B", "K", "M", "O", "O", "N", "L", "P"],
  ["I", "F", "I", "S", "H", "R", "Q", "H"],
  ["R", "A", "T", "K", "W", "M", "Z", "O"],
  ["D", "X", "P", "R", "V", "Y", "J", "U"],
  ["L", "Q", "W", "P", "E", "N", "B", "S"],
  ["Z", "M", "C", "V", "L", "E", "T", "E"],
  ["S", "U", "N", "X", "R", "E", "K", "P"],
];

const words = [
  "CAT",
  "DOG",
  "BIRD",
  "HOUSE",
  "FISH",
  "TREE",
  "APPLE",
  "SUN",
  "MOON",
];

export function WordSearch() {
  const navigate = useNavigate();

  const [aiRec, setAiRec] = useState(() => calculateAdaptiveDifficulty("word-search"));
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const rec = calculateAdaptiveDifficulty("word-search");
    setAiRec(rec);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  function handleCellClick(rowIndex: number, colIndex: number) {
    const cellId = `${rowIndex}-${colIndex}`;
    setSelectedCells((prev) => {
      if (prev.includes(cellId)) {
        return prev.filter((cell) => cell !== cellId);
      }
      return [...prev, cellId];
    });
  }

  function checkWord() {
    if (selectedCells.length < 2) {
      setMessage("Please select all letters of a word.");
      return;
    }

    const positions = selectedCells.map((cellId) => {
      const [row, col] = cellId.split("-").map(Number);
      return { row, col, letter: grid[row][col] };
    });

    const rowDifference = positions[1].row - positions[0].row;
    const colDifference = positions[1].col - positions[0].col;

    const rowStep = Math.sign(rowDifference);
    const colStep = Math.sign(colDifference);

    const validDirection =
      (rowStep === 0 && colStep !== 0) ||
      (rowStep !== 0 && colStep === 0) ||
      (Math.abs(rowDifference) === Math.abs(colDifference));

    if (!validDirection) {
      setMessage("Please select letters in a straight line.");
      return;
    }

    for (let i = 1; i < positions.length; i++) {
      const expectedRow = positions[0].row + rowStep * i;
      const expectedCol = positions[0].col + colStep * i;

      if (positions[i].row !== expectedRow || positions[i].col !== expectedCol) {
        setMessage("Please select consecutive letters in a straight line.");
        return;
      }
    }

    const selectedWord = positions.map((p) => p.letter).join("");
    const reversedWord = selectedWord.split("").reverse().join("");

    const matchingWord = words.find(
      (w) => w === selectedWord || w === reversedWord
    );

    if (matchingWord) {
      if (foundWords.includes(matchingWord)) {
        setMessage("You already found this word!");
      } else {
        const newFound = [...foundWords, matchingWord];
        setFoundWords(newFound);
        setMessage(`Great job! You found ${matchingWord}.`);

        // If completed all words, record in AI engine
        if (newFound.length === words.length) {
          const accuracy = 100;
          const newRec = recordGameSession({
            gameSlug: "word-search",
            patientId: "demo_patient",
            difficulty: aiRec.recommendedLevel,
            score: words.length,
            correct: words.length,
            wrong: 0,
            accuracy,
            responseTime: seconds,
            hintsUsed: 0,
            completed: true,
          });
          setAiRec(newRec);

          saveActivityRecord({
            activityName: "Word Search",
            gameSlug: "word-search",
            category: "Language",
            completed: true,
            score: words.length,
            totalPossible: words.length,
            accuracy: 100,
            timeTakenSeconds: seconds,
            difficulty: aiRec.recommendedLevel,
            hintsUsed: 0,
            attempts: 1,
          });
        }
      }
      setSelectedCells([]);
    } else {
      setMessage("That is not one of the hidden words. Try again!");
    }
  }

  function clearSelection() {
    setSelectedCells([]);
    setMessage("");
  }

  return (
    <div className="ds-shell ds-page-enter">
      <PatientSidebar active="/play" />

      <main className="ds-main" id="main-content">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">LANGUAGE &amp; FOCUS ACTIVITY</p>
          <h1 className="ds-page-title">Word Search</h1>
          <p className="ds-page-sub">Find hidden words in the grid. Click the letters in a straight line.</p>
        </div>

        <div className="ds-alert ds-alert-info" style={{ marginBottom: 24, maxWidth: 760 }}>
          <span style={{ fontSize: 18 }}>🧠</span>
          <div>
            <strong style={{ color: "var(--role-primary)", fontSize: 14 }}>AI Adaptive Recommendation:</strong>
            <p style={{ margin: "2px 0 0", fontSize: 14 }}>{getPatientEncouragementMessage(aiRec)}</p>
          </div>
        </div>

        <div className="ds-card" style={{ maxWidth: 760, padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "var(--ds-text)" }}>Find Hidden Words</h2>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ds-text2)" }}>
                Found <strong>{foundWords.length}</strong> of <strong>{words.length}</strong> words &nbsp;•&nbsp; Level: <strong>{aiRec.recommendedLevel}</strong>
              </p>
            </div>
            <button className="ds-btn-secondary" style={{ padding: "6px 14px", minHeight: 34, fontSize: 13 }} onClick={() => navigate("/play")}>
              Back to Activities
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 32, alignItems: "start" }}>
            {/* Grid */}
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
                  gap: 8,
                  marginBottom: 20,
                  maxWidth: 420
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => {
                    const cellId = `${rowIndex}-${colIndex}`;
                    const isSelected = selectedCells.includes(cellId);

                    return (
                      <button
                        key={cellId}
                        style={{
                          aspectRatio: "1/1",
                          borderRadius: 8,
                          fontSize: 18,
                          fontWeight: 700,
                          cursor: "pointer",
                          background: isSelected ? "var(--role-primary)" : "var(--ds-surface2)",
                          color: isSelected ? "#fff" : "var(--ds-text)",
                          border: "1px solid var(--ds-border)",
                          boxShadow: "var(--ds-shadow-sm)",
                          transition: "all 0.15s"
                        }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {letter}
                      </button>
                    );
                  })
                )}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="ds-btn-primary" onClick={checkWord}>
                  Check Word
                </button>
                <button className="ds-btn-secondary" onClick={clearSelection}>
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Word list */}
            <div className="ds-card" style={{ padding: 20, background: "var(--ds-surface2)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--ds-text)", textTransform: "uppercase", letterSpacing: 1 }}>
                Words to Find
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {words.map((word) => {
                  const isFound = foundWords.includes(word);
                  return (
                    <div
                      key={word}
                      style={{
                        padding: "8px 12px", borderRadius: 6, fontSize: 14, fontWeight: 700,
                        background: isFound ? "var(--ds-success)" : "var(--ds-surface)",
                        color: isFound ? "#fff" : "var(--ds-text)",
                        textDecoration: isFound ? "line-through" : "none",
                        border: "1px solid var(--ds-border)"
                      }}
                    >
                      {word} {isFound ? "✓" : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {message && (
            <div className="ds-alert ds-alert-info" style={{ marginTop: 24 }}>
              <p>{message}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}