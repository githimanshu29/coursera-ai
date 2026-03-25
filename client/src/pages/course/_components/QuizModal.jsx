import { useState } from "react";
import { submitQuizApi, skipQuizApi } from "../../../lib/api.js";

const QuizModal = ({ quiz, onClose, onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(
    Array(quiz.questions.length).fill(null),
  );
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (optionIndex) => {
    if (result) return; // already submitted
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitQuizApi(quiz._id, answers);
      setResult(res.data);
      setCurrentQ(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await skipQuizApi(quiz._id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const allAnswered = !answers.includes(null);
  const q = quiz.questions[currentQ];
  const resultQ = result?.results?.[currentQ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ color: "white", fontSize: "18px", fontWeight: "700" }}>
              {quiz.chapterName}
            </h2>
            <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
              {result
                ? "Quiz Complete"
                : `Question ${currentQ + 1} of ${quiz.questions.length}`}
            </p>
          </div>
          {/* progress dots */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {quiz.questions.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentQ(i)}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  background: result
                    ? result.results[i].isCorrect
                      ? "#4ade80"
                      : "#f87171"
                    : i === currentQ
                      ? "#7c3aed"
                      : answers[i] !== null
                        ? "#a78bfa"
                        : "rgba(255,255,255,0.1)",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        </div>

        {/* result banner */}
        {result && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              background: result.passed
                ? "rgba(34,197,94,0.1)"
                : "rgba(248,113,113,0.1)",
              border: `1px solid ${result.passed ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.2)"}`,
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  color: result.passed ? "#4ade80" : "#f87171",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                {result.score}%{" "}
                {result.passed ? "— Passed! 🎉" : "— Try again next time"}
              </p>
              <p
                style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}
              >
                {result.correct}/{result.total} correct answers
              </p>
            </div>
            {result.passed && (
              <div
                style={{
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: "50%",
                  width: "52px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🏆
              </div>
            )}
          </div>
        )}

        {/* question */}
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            {q.question}
          </p>

          {/* options */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {q.options.map((option, i) => {
              const isSelected = answers[currentQ] === i;
              const isCorrect = result && i === resultQ?.correctIndex;
              const isWrong = result && isSelected && !resultQ?.isCorrect;

              let borderColor = "rgba(255,255,255,0.08)";
              let bg = "rgba(255,255,255,0.02)";
              let textColor = "#d1d5db";

              if (isCorrect) {
                borderColor = "rgba(34,197,94,0.5)";
                bg = "rgba(34,197,94,0.1)";
                textColor = "#4ade80";
              } else if (isWrong) {
                borderColor = "rgba(248,113,113,0.5)";
                bg = "rgba(248,113,113,0.1)";
                textColor = "#f87171";
              } else if (isSelected) {
                borderColor = "rgba(124,58,237,0.5)";
                bg = "rgba(124,58,237,0.1)";
                textColor = "#a78bfa";
              }

              return (
                <div
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: `1px solid ${borderColor}`,
                    background: bg,
                    cursor: result ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background:
                        isSelected || isCorrect
                          ? borderColor
                          : "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "700",
                      flexShrink: 0,
                      color: textColor,
                    }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span
                    style={{
                      color: textColor,
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {option}
                  </span>
                  {isCorrect && (
                    <span style={{ marginLeft: "auto", fontSize: "16px" }}>
                      ✓
                    </span>
                  )}
                  {isWrong && (
                    <span style={{ marginLeft: "auto", fontSize: "16px" }}>
                      ✗
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* explanation */}
          {result && resultQ && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.2)",
              }}
            >
              <p
                style={{
                  color: "#a78bfa",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                Explanation
              </p>
              <p
                style={{
                  color: "#d1d5db",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                {resultQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: currentQ === 0 ? "#374151" : "#9ca3af",
              fontSize: "13px",
              cursor: currentQ === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Previous
          </button>
          <button
            onClick={() =>
              setCurrentQ(Math.min(quiz.questions.length - 1, currentQ + 1))
            }
            disabled={currentQ === quiz.questions.length - 1}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color:
                currentQ === quiz.questions.length - 1 ? "#374151" : "#9ca3af",
              fontSize: "13px",
              cursor:
                currentQ === quiz.questions.length - 1
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Next →
          </button>
        </div>

        {/* action buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          {!result ? (
            <>
              <button
                onClick={handleSkip}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#6b7280",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Skip Quiz
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                style={{
                  flex: 2,
                  padding: "11px",
                  borderRadius: "10px",
                  background: allAnswered
                    ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                    : "rgba(124,58,237,0.3)",
                  border: "none",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: allAnswered ? "pointer" : "not-allowed",
                }}
              >
                {isSubmitting
                  ? "Submitting..."
                  : `Submit ${allAnswered ? "" : `(${answers.filter((a) => a !== null).length}/${quiz.questions.length})`}`}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onComplete(result);
                onClose();
              }}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                border: "none",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {result.passed ? "Continue →" : "Continue anyway →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
