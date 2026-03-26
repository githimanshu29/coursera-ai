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
      {/* header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>
          My Quizzes
        </h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
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

      {/* courses with quizzes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {courses?.map((course) => (
          <div
            key={course.cid}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${
                expandedCourse === course.cid
                  ? "rgba(124,58,237,0.3)"
                  : "rgba(255,255,255,0.06)"
              }`,
              borderRadius: "14px",
              overflow: "hidden",
              transition: "border-color 0.2s",
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
              }}
            >
              {/* icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
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
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {course.name}
                </p>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    marginTop: "2px",
                  }}
                >
                  {course.noOfChapters} chapters
                  {course.status === "READY" && (
                    <span
                      style={{
                        marginLeft: "8px",
                        padding: "1px 6px",
                        borderRadius: "20px",
                        fontSize: "10px",
                        background: "rgba(34,197,94,0.1)",
                        color: "#4ade80",
                      }}
                    >
                      READY
                    </span>
                  )}
                </p>
              </div>

              {/* expand arrow */}
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "18px",
                  transform:
                    expandedCourse === course.cid
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                ↓
              </span>
            </div>

            {/* expanded quiz list */}
            {expandedCourse === course.cid && (
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  padding: "16px 20px",
                }}
              >
                {quizzesLoading ? (
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                  >
                    Loading quizzes...
                  </p>
                ) : attemptedQuizzes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <p style={{ color: "#374151", fontSize: "13px" }}>
                      No quizzes attempted yet for this course.
                    </p>
                    <button
                      onClick={() => navigate(`/course/${course.cid}`)}
                      style={{
                        marginTop: "12px",
                        padding: "8px 20px",
                        borderRadius: "8px",
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        color: "#a78bfa",
                        fontSize: "13px",
                        cursor: "pointer",
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
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      {[
                        { label: "Attempted", value: attemptedQuizzes.length },
                        { label: "Passed", value: passedCount },
                        { label: "Avg Score", value: `${avgScore}%` },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            background: "rgba(124,58,237,0.08)",
                            border: "1px solid rgba(124,58,237,0.15)",
                            textAlign: "center",
                          }}
                        >
                          <p
                            style={{
                              color: "#a78bfa",
                              fontSize: "18px",
                              fontWeight: "700",
                            }}
                          >
                            {stat.value}
                          </p>
                          <p
                            style={{
                              color: "#6b7280",
                              fontSize: "11px",
                              marginTop: "2px",
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
                      {attemptedQuizzes.map((quiz) => (
                        <div
                          key={quiz._id}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "10px",
                            background: "rgba(255,255,255,0.02)",
                            border: `1px solid ${
                              quiz.passed
                                ? "rgba(34,197,94,0.2)"
                                : "rgba(248,113,113,0.2)"
                            }`,
                            cursor: "pointer",
                            transition: "all 0.2s",
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
                              "rgba(255,255,255,0.02)")
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
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
                              }}
                            >
                              <span
                                style={{
                                  padding: "3px 10px",
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
                              <span
                                style={{
                                  color: "#6b7280",
                                  fontSize: "14px",
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
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600",
                background:
                  i === currentQ
                    ? "#7c3aed"
                    : correct
                      ? "rgba(34,197,94,0.2)"
                      : "rgba(248,113,113,0.2)",
                color:
                  i === currentQ ? "white" : correct ? "#4ade80" : "#f87171",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* question */}
      <p
        style={{
          color: "white",
          fontSize: "13px",
          fontWeight: "600",
          marginBottom: "12px",
          lineHeight: "1.5",
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
          marginBottom: "12px",
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
                padding: "9px 12px",
                borderRadius: "8px",
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
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
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
                }}
              >
                {opt}
              </span>
              {isCorrectOpt && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: "#4ade80",
                    fontSize: "13px",
                  }}
                >
                  ✓
                </span>
              )}
              {isWrong && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: "#f87171",
                    fontSize: "13px",
                  }}
                >
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
          padding: "10px 14px",
          borderRadius: "8px",
          background: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.15)",
        }}
      >
        <p
          style={{
            color: "#a78bfa",
            fontSize: "11px",
            fontWeight: "600",
            marginBottom: "4px",
          }}
        >
          Explanation
        </p>
        <p style={{ color: "#d1d5db", fontSize: "12px", lineHeight: "1.6" }}>
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
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default MyQuizzes;
