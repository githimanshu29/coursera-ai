import { useState, useEffect, useCallback } from "react";
import { submitQuizApi, skipQuizApi, retakeQuizApi, generateQuizApi } from "../../../lib/api.js";

const QuizModal = ({ quiz, onClose, onComplete, courseId, chapterIndex }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(
    Array(quiz.questions.length).fill(null),
  );
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [slideDir, setSlideDir] = useState("right"); // for slide animation
  const [animKey, setAnimKey] = useState(0); // forces re-render for animation
  const [showConfetti, setShowConfetti] = useState(false);
  const [unansweredWarning, setUnansweredWarning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [result]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (result) return;
      if (e.key === "ArrowLeft" && currentQ > 0) {
        setSlideDir("left");
        setAnimKey((k) => k + 1);
        setCurrentQ((q) => q - 1);
      }
      if (e.key === "ArrowRight" && currentQ < quiz.questions.length - 1) {
        setSlideDir("right");
        setAnimKey((k) => k + 1);
        setCurrentQ((q) => q + 1);
      }
      if (e.key >= "1" && e.key <= "4") {
        handleSelect(parseInt(e.key) - 1);
      }
    },
    [currentQ, result, quiz.questions.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (optionIndex) => {
    if (result) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
    setUnansweredWarning(false);

    // Auto-advance after short delay if not on last question
    if (currentQ < quiz.questions.length - 1) {
      setTimeout(() => {
        setSlideDir("right");
        setAnimKey((k) => k + 1);
        setCurrentQ((q) => q + 1);
      }, 400);
    }
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      setUnansweredWarning(true);
      // Jump to first unanswered
      const firstUnanswered = answers.findIndex((a) => a === null);
      setSlideDir(firstUnanswered > currentQ ? "right" : "left");
      setAnimKey((k) => k + 1);
      setCurrentQ(firstUnanswered);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitQuizApi(quiz._id, answers);
      setResult(res.data);
      setCurrentQ(0);
      if (res.data.passed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
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

  const handleRetake = async () => {
    if (!courseId && chapterIndex === undefined) return;
    setIsRetaking(true);
    try {
      await retakeQuizApi(quiz._id);
      const res = await generateQuizApi(courseId, chapterIndex);
      const newQuiz = res.data.quiz;
      // Reset state with new quiz data
      setAnswers(Array(newQuiz.questions.length).fill(null));
      setResult(null);
      setCurrentQ(0);
      setTimeElapsed(0);
      setAnimKey((k) => k + 1);
      // Call onComplete with retake info to trigger parent refresh
      if (onComplete) onComplete({ retake: true, newQuiz });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRetaking(false);
    }
  };

  const navigateQuestion = (dir) => {
    setSlideDir(dir);
    setAnimKey((k) => k + 1);
    if (dir === "left") setCurrentQ(Math.max(0, currentQ - 1));
    else setCurrentQ(Math.min(quiz.questions.length - 1, currentQ + 1));
  };

  const allAnswered = !answers.includes(null);
  const q = quiz.questions[currentQ];
  const resultQ = result?.results?.[currentQ];
  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPercent = (answeredCount / quiz.questions.length) * 100;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "quizOverlayIn 0.35s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <style>{`
        @keyframes quizOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes quizCardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes quizSlideRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes quizSlideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes quizPop {
          0% { transform: scale(0.92); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes quizOptionIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes quizShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes quizConfettiPiece {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) rotate(720deg) scale(0); opacity: 0; }
        }
        @keyframes quizPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
        }
        @keyframes quizResultIn {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes quizScoreCount {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes quizCheckmark {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .quiz-option-hover:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(124,58,237,0.4) !important;
          transform: translateX(4px);
        }
        .quiz-modal-scrollbar::-webkit-scrollbar { width: 6px; }
        .quiz-modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .quiz-modal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.3);
          border-radius: 3px;
        }
      `}</style>

      {/* Confetti overlay */}
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1001 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                bottom: "40%",
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                background: ["#7c3aed", "#4ade80", "#f59e0b", "#ec4899", "#06b6d4", "#f87171"][i % 6],
                animation: `quizConfettiPiece ${1 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="quiz-modal-scrollbar"
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #131b30 50%, #1a1f36 100%)",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "quizCardIn 0.45s ease",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* ═══ Header ═══ */}
        <div
          style={{
            padding: "20px 28px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(124,58,237,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "180px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h2
                    style={{
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "700",
                      lineHeight: "1.3",
                    }}
                  >
                    {quiz.chapterName}
                  </h2>
                  <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>
                    {result
                      ? "Quiz Complete — Review your answers"
                      : `Question ${currentQ + 1} of ${quiz.questions.length}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Timer + close */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {!result && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>
                    {formatTime(timeElapsed)}
                  </span>
                </div>
              )}
              <button
                onClick={onClose}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#6b7280",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(248,113,113,0.1)";
                  e.currentTarget.style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "#6b7280";
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ─ Progress bar ─ */}
          <div style={{ marginTop: "14px" }}>
            <div
              style={{
                width: "100%",
                height: "4px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "4px",
                  background: result
                    ? result.passed
                      ? "linear-gradient(90deg, #4ade80, #10b981)"
                      : "linear-gradient(90deg, #f87171, #ef4444)"
                    : "linear-gradient(90deg, #7c3aed, #a78bfa)",
                  width: `${result ? 100 : progressPercent}%`,
                  transition: "width 0.5s cubic-bezier(.25,.8,.25,1)",
                }}
              />
            </div>

            {/* Question dot indicators */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "10px", justifyContent: "center" }}>
              {quiz.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSlideDir(i > currentQ ? "right" : "left");
                    setAnimKey((k) => k + 1);
                    setCurrentQ(i);
                  }}
                  style={{
                    width: i === currentQ ? "28px" : "10px",
                    height: "10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    border: "none",
                    padding: 0,
                    background: result
                      ? result.results[i].isCorrect
                        ? "#4ade80"
                        : "#f87171"
                      : i === currentQ
                        ? "linear-gradient(90deg, #7c3aed, #a78bfa)"
                        : answers[i] !== null
                          ? "#a78bfa"
                          : "rgba(255,255,255,0.1)",
                    transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
                    animation: i === currentQ && !result ? "quizPulse 2s ease-in-out infinite" : "none",
                  }}
                />
              ))}
            </div>

            {!result && (
              <p style={{ color: "#4b5563", fontSize: "11px", textAlign: "center", marginTop: "6px" }}>
                {answeredCount}/{quiz.questions.length} answered · Use arrow keys to navigate
              </p>
            )}
          </div>
        </div>

        {/* ═══ Content ═══ */}
        <div style={{ padding: "24px 28px" }}>
          {/* ─ Result banner ─ */}
          {result && (
            <div
              style={{
                padding: "24px",
                borderRadius: "20px",
                background: result.passed
                  ? "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))"
                  : "linear-gradient(135deg, rgba(248,113,113,0.1), rgba(239,68,68,0.05))",
                border: `1px solid ${result.passed ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.2)"}`,
                marginBottom: "24px",
                animation: "quizResultIn 0.6s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative gradient */}
              <div
                style={{
                  position: "absolute",
                  top: "-50%",
                  right: "-20%",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: result.passed
                    ? "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 60%)"
                    : "radial-gradient(circle, rgba(248,113,113,0.08) 0%, transparent 60%)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                    <span
                      style={{
                        color: result.passed ? "#4ade80" : "#f87171",
                        fontSize: "36px",
                        fontWeight: "800",
                        lineHeight: "1",
                        animation: "quizScoreCount 0.8s ease",
                      }}
                    >
                      {result.score}%
                    </span>
                    <span style={{ color: result.passed ? "#4ade80" : "#f87171", fontSize: "16px", fontWeight: "600" }}>
                      {result.passed ? "Passed!" : "Not passed"}
                    </span>
                  </div>
                  <p style={{ color: "#6b7280", fontSize: "13px" }}>
                    {result.correct}/{result.total} correct · Time: {formatTime(timeElapsed)}
                  </p>
                </div>

                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: result.passed
                      ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))"
                      : "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(239,68,68,0.05))",
                    border: `2px solid ${result.passed ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.25)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    animation: "quizPop 0.6s ease",
                    flexShrink: 0,
                  }}
                >
                  {result.passed ? "🏆" : "📝"}
                </div>
              </div>
            </div>
          )}

          {/* ─ Question ─ */}
          <div
            key={`q-${currentQ}-${animKey}`}
            style={{
              animation: `${slideDir === "right" ? "quizSlideRight" : "quizSlideLeft"} 0.35s ease`,
              marginBottom: "20px",
            }}
          >
            {/* Question badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 14px",
                borderRadius: "20px",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.18)",
                marginBottom: "16px",
              }}
            >
              <span style={{ color: "#a78bfa", fontSize: "12px", fontWeight: "700" }}>
                Q{currentQ + 1}
              </span>
              {result && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: resultQ?.isCorrect ? "#4ade80" : "#f87171",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {resultQ?.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                </span>
              )}
            </div>

            <p
              style={{
                color: "white",
                fontSize: "17px",
                fontWeight: "600",
                lineHeight: "1.65",
                marginBottom: "22px",
              }}
            >
              {q.question}
            </p>

            {/* ─ Options ─ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {q.options.map((option, i) => {
                const isSelected = answers[currentQ] === i;
                const isCorrect = result && i === resultQ?.correctIndex;
                const isWrong = result && isSelected && !resultQ?.isCorrect;

                let borderColor = "rgba(255,255,255,0.08)";
                let bg = "rgba(255,255,255,0.02)";
                let textColor = "#d1d5db";
                let labelBg = "rgba(255,255,255,0.06)";

                if (isCorrect) {
                  borderColor = "rgba(34,197,94,0.5)";
                  bg = "rgba(34,197,94,0.08)";
                  textColor = "#4ade80";
                  labelBg = "rgba(34,197,94,0.2)";
                } else if (isWrong) {
                  borderColor = "rgba(248,113,113,0.5)";
                  bg = "rgba(248,113,113,0.08)";
                  textColor = "#f87171";
                  labelBg = "rgba(248,113,113,0.2)";
                } else if (isSelected) {
                  borderColor = "rgba(124,58,237,0.5)";
                  bg = "rgba(124,58,237,0.08)";
                  textColor = "#c4b5fd";
                  labelBg = "rgba(124,58,237,0.25)";
                }

                return (
                  <div
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={!result && !isSelected ? "quiz-option-hover" : ""}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "14px",
                      border: `1.5px solid ${borderColor}`,
                      background: bg,
                      cursor: result ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      transition: "all 0.25s cubic-bezier(.25,.8,.25,1)",
                      transform: isSelected && !result ? "scale(1.01)" : "scale(1)",
                      animation: `quizOptionIn 0.3s ease ${i * 0.06}s both`,
                    }}
                  >
                    <span
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "10px",
                        background: labelBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: "700",
                        flexShrink: 0,
                        color: textColor,
                        transition: "all 0.25s",
                      }}
                    >
                      {["A", "B", "C", "D"][i]}
                    </span>
                    <span
                      style={{
                        color: textColor,
                        fontSize: "14px",
                        lineHeight: "1.55",
                        flex: 1,
                        transition: "color 0.2s",
                      }}
                    >
                      {option}
                    </span>
                    {isCorrect && (
                      <span
                        style={{
                          flexShrink: 0,
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "rgba(34,197,94,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          animation: "quizPop 0.4s ease",
                        }}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    {isWrong && (
                      <span
                        style={{
                          flexShrink: 0,
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "rgba(248,113,113,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ─ Explanation ─ */}
            {result && resultQ && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: "rgba(167,139,250,0.06)",
                  border: "1px solid rgba(167,139,250,0.15)",
                  animation: "quizSlideRight 0.4s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "rgba(167,139,250,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span style={{ color: "#a78bfa", fontSize: "12px", fontWeight: "700", letterSpacing: "0.3px" }}>
                    EXPLANATION
                  </span>
                </div>
                <p style={{ color: "#c4b5fd", fontSize: "13px", lineHeight: "1.7" }}>
                  {resultQ.explanation}
                </p>
              </div>
            )}

            {/* Unanswered warning */}
            {unansweredWarning && !result && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  animation: "quizShake 0.5s ease",
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: "500" }}>
                  Please answer this question before submitting
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Footer ═══ */}
        <div
          style={{
            padding: "16px 28px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.15)",
            borderRadius: "0 0 28px 28px",
          }}
        >
          {/* Navigation */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              onClick={() => navigateQuestion("left")}
              disabled={currentQ === 0}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: currentQ === 0 ? "#1f2937" : "#9ca3af",
                fontSize: "13px",
                cursor: currentQ === 0 ? "not-allowed" : "pointer",
                fontWeight: "500",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={() => navigateQuestion("right")}
              disabled={currentQ === quiz.questions.length - 1}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: currentQ === quiz.questions.length - 1 ? "#1f2937" : "#9ca3af",
                fontSize: "13px",
                cursor: currentQ === quiz.questions.length - 1 ? "not-allowed" : "pointer",
                fontWeight: "500",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              Next
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            {!result ? (
              <>
                <button
                  onClick={handleSkip}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#6b7280",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: "500",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.color = "#9ca3af";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#6b7280";
                  }}
                >
                  Skip Quiz
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: "12px",
                    background: allAnswered
                      ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                      : "rgba(124,58,237,0.25)",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: allAnswered ? "pointer" : "default",
                    boxShadow: allAnswered
                      ? "0 4px 20px rgba(124,58,237,0.3)"
                      : "none",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (allAnswered) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 8px 28px rgba(124,58,237,0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = allAnswered ? "0 4px 20px rgba(124,58,237,0.3)" : "none";
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid white",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      Submitting...
                    </>
                  ) : allAnswered ? (
                    <>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Quiz
                    </>
                  ) : (
                    `Answer all questions (${answeredCount}/${quiz.questions.length})`
                  )}
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                {/* Retake button — only show if courseId and chapterIndex are available */}
                {courseId !== undefined && chapterIndex !== undefined && (
                  <button
                    onClick={handleRetake}
                    disabled={isRetaking}
                    style={{
                      flex: 1,
                      padding: "13px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(124,58,237,0.3)",
                      color: "#a78bfa",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: isRetaking ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isRetaking) {
                        e.currentTarget.style.background = "rgba(124,58,237,0.1)";
                        e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
                    }}
                  >
                    {isRetaking ? (
                      <>
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            border: "2px solid rgba(167,139,250,0.3)",
                            borderTop: "2px solid #a78bfa",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Attempt Again
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    onComplete(result);
                    onClose();
                  }}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "12px",
                    background: result.passed
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: result.passed
                      ? "0 4px 20px rgba(16,185,129,0.3)"
                      : "0 4px 20px rgba(124,58,237,0.3)",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {result.passed ? "🎉 Continue" : "Continue anyway"}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default QuizModal;
