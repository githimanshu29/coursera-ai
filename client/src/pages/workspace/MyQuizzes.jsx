import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getUserCoursesApi, getCourseQuizStatusApi } from "../../lib/api.js";

const MyQuizzes = () => {
  const navigate = useNavigate();
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["userCourses"],
    queryFn: async () => {
      const res = await getUserCoursesApi();
      return res.data.courses;
    },
  });

  // fetch quiz statuses for expanded course
  const { data: quizStatuses, isLoading: quizzesLoading } = useQuery({
    queryKey: ["quizStatus", expandedCourse],
    queryFn: async () => {
      const res = await getCourseQuizStatusApi(expandedCourse);
      return res.data.quizzes;
    },
    enabled: !!expandedCourse,
  });

  const attemptedQuizzes = quizStatuses?.filter((q) => q.attempted) || [];
  const passedCount = attemptedQuizzes.filter((q) => q.passed).length;
  const avgScore =
    attemptedQuizzes.length > 0
      ? Math.round(
          attemptedQuizzes.reduce((acc, q) => acc + q.score, 0) /
            attemptedQuizzes.length,
        )
      : 0;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes quizPageFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 2000px; }
        }
      `}</style>

      {/* header */}
      <div style={{ marginBottom: "28px", animation: "quizPageFadeIn 0.5s ease" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "5px 14px", borderRadius: "20px",
          background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
          marginBottom: "12px", fontSize: "12px",
        }}>
          <span style={{ fontSize: "14px" }}>📝</span>
          <span style={{ color: "#a78bfa", fontWeight: "600" }}>Quiz Center</span>
        </div>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "700", marginBottom: "4px" }}>
          My Quizzes
        </h2>
        <p style={{ color: "#6b7280", fontSize: "13px" }}>
          Review your quiz attempts, scores and explanations
        </p>
      </div>

      {isLoading && (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid rgba(124,58,237,0.3)",
              borderTop: "3px solid #7c3aed",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* empty state */}
      {!isLoading && (!courses || courses.length === 0) && (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: "16px",
          animation: "quizPageFadeIn 0.5s ease",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
          <h3 style={{ color: "white", fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            No courses yet
          </h3>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
            Create and complete courses to see your quiz results here
          </p>
          <button
            onClick={() => navigate("/workspace")}
            style={{
              padding: "10px 24px", borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", color: "white",
              fontSize: "14px", fontWeight: "600", cursor: "pointer",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* courses with quizzes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {courses?.map((course, courseIdx) => (
          <div
            key={course.cid}
            style={{
              background: expandedCourse === course.cid
                ? "rgba(124,58,237,0.04)"
                : "rgba(255,255,255,0.02)",
              border: `1px solid ${
                expandedCourse === course.cid
                  ? "rgba(124,58,237,0.3)"
                  : "rgba(255,255,255,0.06)"
              }`,
              borderRadius: "14px",
              overflow: "hidden",
              transition: "all 0.3s ease",
              animation: `quizPageFadeIn 0.5s ease ${courseIdx * 0.05}s both`,
            }}
          >
            {/* course header — clickable */}
            <div
              onClick={() =>
                setExpandedCourse(
                  expandedCourse === course.cid ? null : course.cid,
                )
              }
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {/* icon */}
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                📝
              </div>

              {/* course info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {course.name}
                </p>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  marginTop: "3px", flexWrap: "wrap",
                }}>
                  <span style={{ color: "#6b7280", fontSize: "12px" }}>
                    {course.noOfChapters} chapters
                  </span>
                  {course.status === "READY" && (
                    <span
                      style={{
                        padding: "1px 8px",
                        borderRadius: "20px",
                        fontSize: "10px",
                        fontWeight: "600",
                        background: "rgba(34,197,94,0.1)",
                        color: "#4ade80",
                        border: "1px solid rgba(34,197,94,0.2)",
                      }}
                    >
                      READY
                    </span>
                  )}
                </div>
              </div>

              {/* expand arrow */}
              <div
                style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: expandedCourse === course.cid
                    ? "rgba(124,58,237,0.15)"
                    : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: expandedCourse === course.cid ? "#a78bfa" : "#6b7280",
                    fontSize: "14px",
                    transform: expandedCourse === course.cid ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                    display: "inline-block",
                  }}
                >
                  ↓
                </span>
              </div>
            </div>

            {/* expanded quiz list */}
            {expandedCourse === course.cid && (
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  padding: "16px 20px",
                  animation: "quizPageFadeIn 0.3s ease",
                }}
              >
                {quizzesLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "20px" }}>
                    <div style={{
                      width: "20px", height: "20px",
                      border: "2px solid rgba(124,58,237,0.3)",
                      borderTop: "2px solid #7c3aed",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>Loading quizzes...</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : attemptedQuizzes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: "32px", marginBottom: "10px", opacity: 0.6 }}>📋</div>
                    <p style={{ color: "#4b5563", fontSize: "13px", marginBottom: "12px" }}>
                      No quizzes attempted yet for this course.
                    </p>
                    <button
                      onClick={() => navigate(`/course/${course.cid}`)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "10px",
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        color: "#a78bfa",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s",
                      }}
                    >
                      Go study →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* stats row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "10px",
                        marginBottom: "18px",
                      }}
                    >
                      {[
                        { label: "Attempted", value: attemptedQuizzes.length, icon: "📊", color: "#a78bfa" },
                        { label: "Passed", value: passedCount, icon: "✅", color: "#4ade80" },
                        { label: "Avg Score", value: `${avgScore}%`, icon: "🎯", color: avgScore >= 70 ? "#4ade80" : "#facc15" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            padding: "14px",
                            borderRadius: "12px",
                            background: "rgba(124,58,237,0.06)",
                            border: "1px solid rgba(124,58,237,0.12)",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: "12px", marginBottom: "4px" }}>{stat.icon}</div>
                          <p
                            style={{
                              color: stat.color,
                              fontSize: "20px",
                              fontWeight: "800",
                            }}
                          >
                            {stat.value}
                          </p>
                          <p
                            style={{
                              color: "#6b7280",
                              fontSize: "11px",
                              marginTop: "2px",
                              fontWeight: "500",
                            }}
                          >
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* quiz cards */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {attemptedQuizzes.map((quiz, quizIdx) => (
                        <div
                          key={quiz._id}
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            background: selectedQuiz?._id === quiz._id
                              ? "rgba(124,58,237,0.06)"
                              : "rgba(255,255,255,0.02)",
                            border: `1px solid ${
                              quiz.passed
                                ? "rgba(34,197,94,0.2)"
                                : "rgba(248,113,113,0.2)"
                            }`,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            animation: `quizPageFadeIn 0.3s ease ${quizIdx * 0.05}s both`,
                          }}
                          onClick={() =>
                            setSelectedQuiz(
                              selectedQuiz?._id === quiz._id ? null : quiz,
                            )
                          }
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.04)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              selectedQuiz?._id === quiz._id
                                ? "rgba(124,58,237,0.06)"
                                : "rgba(255,255,255,0.02)")
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "12px",
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p
                                style={{
                                  color: "white",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                }}
                              >
                                {quiz.chapterIndex === -1
                                  ? "🏆 Final Quiz"
                                  : `Chapter ${quiz.chapterIndex + 1}`}
                              </p>
                              <p
                                style={{
                                  color: "#6b7280",
                                  fontSize: "11px",
                                  marginTop: "2px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {quiz.chapterName}
                              </p>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  background: quiz.passed
                                    ? "rgba(34,197,94,0.1)"
                                    : "rgba(248,113,113,0.1)",
                                  color: quiz.passed ? "#4ade80" : "#f87171",
                                  border: `1px solid ${
                                    quiz.passed
                                      ? "rgba(34,197,94,0.2)"
                                      : "rgba(248,113,113,0.2)"
                                  }`,
                                }}
                              >
                                {quiz.score}%
                              </span>
                              <div style={{
                                width: "24px", height: "24px", borderRadius: "6px",
                                background: "rgba(255,255,255,0.05)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <span
                                  style={{
                                    color: "#6b7280",
                                    fontSize: "12px",
                                    transform:
                                      selectedQuiz?._id === quiz._id
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                    transition: "transform 0.2s",
                                    display: "inline-block",
                                  }}
                                >
                                  ↓
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* expanded quiz review */}
                          {selectedQuiz?._id === quiz._id && (
                            <QuizReview quiz={quiz} />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── inline quiz review component ─────────────────────────────
const QuizReview = ({ quiz }) => {
  const [currentQ, setCurrentQ] = useState(0);

  if (!quiz.questions?.length) return null;

  const q = quiz.questions[currentQ];
  const userAnswer = quiz.userAnswers?.[currentQ];
  const isCorrect = userAnswer === q.correctIndex;

  return (
    <div
      style={{
        marginTop: "16px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "16px",
        animation: "quizPageFadeIn 0.3s ease",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* question navigation dots */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        {quiz.questions.map((_, i) => {
          const correct =
            quiz.userAnswers?.[i] === quiz.questions[i].correctIndex;
          return (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: i === currentQ ? "2px solid #7c3aed" : "1px solid transparent",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "700",
                background:
                  i === currentQ
                    ? "rgba(124,58,237,0.2)"
                    : correct
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(248,113,113,0.15)",
                color:
                  i === currentQ ? "#a78bfa" : correct ? "#4ade80" : "#f87171",
                transition: "all 0.2s",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* status badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "3px 10px", borderRadius: "20px",
        background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
        border: `1px solid ${isCorrect ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.2)"}`,
        marginBottom: "12px",
      }}>
        <span style={{ fontSize: "10px" }}>{isCorrect ? "✓" : "✗"}</span>
        <span style={{
          color: isCorrect ? "#4ade80" : "#f87171",
          fontSize: "11px", fontWeight: "600",
        }}>
          {isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {/* question */}
      <p
        style={{
          color: "white",
          fontSize: "13px",
          fontWeight: "600",
          marginBottom: "12px",
          lineHeight: "1.6",
        }}
      >
        Q{currentQ + 1}. {q.question}
      </p>

      {/* options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        {q.options.map((opt, i) => {
          const isCorrectOpt = i === q.correctIndex;
          const isUserChoice = i === userAnswer;
          const isWrong = isUserChoice && !isCorrectOpt;

          return (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: isCorrectOpt
                  ? "rgba(34,197,94,0.08)"
                  : isWrong
                    ? "rgba(248,113,113,0.08)"
                    : "transparent",
                border: `1px solid ${
                  isCorrectOpt
                    ? "rgba(34,197,94,0.25)"
                    : isWrong
                      ? "rgba(248,113,113,0.25)"
                      : "rgba(255,255,255,0.06)"
                }`,
              }}
            >
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "6px",
                  background: isCorrectOpt
                    ? "rgba(34,197,94,0.2)"
                    : isWrong
                      ? "rgba(248,113,113,0.2)"
                      : "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "700",
                  flexShrink: 0,
                  color: isCorrectOpt
                    ? "#4ade80"
                    : isWrong
                      ? "#f87171"
                      : "#6b7280",
                }}
              >
                {["A", "B", "C", "D"][i]}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: isCorrectOpt
                    ? "#4ade80"
                    : isWrong
                      ? "#f87171"
                      : "#9ca3af",
                  flex: 1,
                  lineHeight: "1.5",
                }}
              >
                {opt}
              </span>
              {isCorrectOpt && (
                <span style={{ color: "#4ade80", fontSize: "14px", flexShrink: 0 }}>
                  ✓
                </span>
              )}
              {isWrong && (
                <span style={{ color: "#f87171", fontSize: "14px", flexShrink: 0 }}>
                  ✗
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* explanation */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "10px",
          background: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ color: "#a78bfa", fontSize: "11px", fontWeight: "600" }}>
            Explanation
          </span>
        </div>
        <p style={{ color: "#d1d5db", fontSize: "12px", lineHeight: "1.65" }}>
          {q.explanation}
        </p>
      </div>

      {/* prev/next */}
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            color: currentQ === 0 ? "#374151" : "#6b7280",
            fontSize: "12px",
            cursor: currentQ === 0 ? "not-allowed" : "pointer",
            fontWeight: "500",
          }}
        >
          ← Prev
        </button>
        <button
          onClick={() =>
            setCurrentQ(Math.min(quiz.questions.length - 1, currentQ + 1))
          }
          disabled={currentQ === quiz.questions.length - 1}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            color:
              currentQ === quiz.questions.length - 1 ? "#374151" : "#6b7280",
            fontSize: "12px",
            cursor:
              currentQ === quiz.questions.length - 1
                ? "not-allowed"
                : "pointer",
            fontWeight: "500",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default MyQuizzes;
