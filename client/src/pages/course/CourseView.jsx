import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCourseByIdApi, getEnrolledCourseByIdApi } from "../../lib/api.js";
import axiosInstance from "../../lib/axios.js";
import ChapterSidebar from "./_components/ChapterSidebar.jsx";
import ChapterContent from "./_components/ChapterContent.jsx";

import { generateQuizApi } from "../../lib/api.js";
import QuizModal from "./_components/QuizModal.jsx";

const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setSidebarOpen(false);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── fetch course directly — works enrolled or not ─────────────────────────
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await getCourseByIdApi(courseId);
      return res.data.course;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // ── fetch enrollment separately — optional ────────────────────────────────
  const { data: enrollmentData, refetch: refetchEnrollment } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: async () => {
      try {
        const res = await getEnrolledCourseByIdApi(courseId);
        return res.data.enrollment;
      } catch {
        return null; // not enrolled yet — that's fine
      }
    },
  });

  // ── mark topic complete ───────────────────────────────────────────────────
  const markCompleteMutation = useMutation({
    mutationFn: async ({ chapterIndex, topicIndex }) => {
      const topicKey = `${chapterIndex}_${topicIndex}`;
      await axiosInstance.post(`/enrollments/complete-topic`, {
        courseId,
        topicKey,
      });
    },
    onSuccess: () => refetchEnrollment(),
  });

  const handleTopicClick = (chapterIndex, topicIndex) => {
    setActiveChapterIndex(chapterIndex);
    setActiveTopicIndex(topicIndex);
  };

  const handleScrollToQuiz = (chapterIndex) => {
    const topics = course?.courseJson?.chapters?.[chapterIndex]?.topics || [];
    const lastTopicIndex = Math.max(0, topics.length - 1);
    setActiveChapterIndex(chapterIndex);
    setActiveTopicIndex(lastTopicIndex);
    setTimeout(() => {
      const target = document.getElementById("chapter-quiz-section");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleMarkComplete = (chapterIndex, topicIndex) => {
    markCompleteMutation.mutate({ chapterIndex, topicIndex });
  };

  //for quiz
  const [showFinalQuiz, setShowFinalQuiz] = useState(false);
  const [finalQuizData, setFinalQuizData] = useState(null);
  const [isLoadingFinalQuiz, setIsLoadingFinalQuiz] = useState(false);
  const MODEL_OPTIONS = {
    groq: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"],
    gemini: ["gemini-2.5-flash-lite", "gemini-2.5-flash"],
  };
  const [quizModelProvider, setQuizModelProvider] = useState("groq");
  const [quizModelName, setQuizModelName] = useState(MODEL_OPTIONS.groq[1]);
  const [quizError, setQuizError] = useState(null);

  const isFullyComplete = course?.status === "READY";

  const handleFinalQuiz = async () => {
    setIsLoadingFinalQuiz(true);
    try {
      const res = await generateQuizApi(course.cid, -1, {
        provider: quizModelProvider,
        model: quizModelName,
      });
      setFinalQuizData(res.data.quiz);
      setShowFinalQuiz(true);
    } catch (err) {
      console.error(err);
      setQuizError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to generate final quiz",
      );
    } finally {
      setIsLoadingFinalQuiz(false);
    }
  };

  if (courseLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0f1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(124,58,237,0.3)",
            borderTop: "3px solid #7c3aed",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            color: "#6b7280",
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Loading course...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0f1e",
        display: "flex",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @keyframes attentionGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(124,58,237,0.25), 0 0 6px rgba(124,58,237,0.15); }
          50% { box-shadow: 0 0 0 1px rgba(124,58,237,0.4), 0 0 10px rgba(124,58,237,0.25); }
        }
      `}</style>
      {/* sidebar */}
      <ChapterSidebar
        course={course}
        enrollment={enrollmentData}
        activeChapterIndex={activeChapterIndex}
        activeTopicIndex={activeTopicIndex}
        onTopicClick={handleTopicClick}
        onScrollToQuiz={handleScrollToQuiz}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* main content */}
      <div
        style={{
          marginLeft: isMobile ? "0" : "300px",
          flex: 1,
          padding: isMobile ? "20px 16px" : "40px",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* top navbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* left side: hamburger + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#9ca3af",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span
              style={{ color: "white", fontWeight: "700", fontSize: "16px" }}
            >
              Learn<span style={{ color: "#a78bfa" }}>ova</span>
            </span>
          </div>

          {/* home button */}
          <button
            onClick={() => navigate("/workspace")}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(124,58,237,0.15)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
        </div>

        {/* chapter content */}
        <ChapterContent
          course={course}
          activeChapterIndex={activeChapterIndex}
          activeTopicIndex={activeTopicIndex}
          onMarkComplete={handleMarkComplete}
        />
        {/* final quiz button */}

        {isFullyComplete && (
          <div
            style={{
              marginTop: "32px",
              padding: "20px 24px",
              borderRadius: "16px",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <p
                style={{ color: "white", fontSize: "16px", fontWeight: "700" }}
              >
                Course Complete — Take the Final Quiz!
              </p>
              <p
                style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}
              >
                Test your knowledge across the entire course. Score 80%+ to earn
                the course badge.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <select
                value={quizModelProvider}
                onChange={(e) => {
                  const nextProvider = e.target.value;
                  setQuizModelProvider(nextProvider);
                  setQuizModelName(MODEL_OPTIONS[nextProvider][0]);
                }}
                disabled={isLoadingFinalQuiz}
                style={{
                  padding: "8px 10px",
                  borderRadius: "10px",
                  background: "rgba(31,41,55,0.8)",
                  border: "1px solid rgba(75,85,99,0.5)",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                  animation: "attentionGlow 2.4s ease-in-out infinite",
                }}
              >
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
              </select>
              <select
                value={quizModelName}
                onChange={(e) => setQuizModelName(e.target.value)}
                disabled={isLoadingFinalQuiz}
                style={{
                  padding: "8px 10px",
                  borderRadius: "10px",
                  background: "rgba(31,41,55,0.8)",
                  border: "1px solid rgba(75,85,99,0.5)",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                  animation: "attentionGlow 2.4s ease-in-out infinite",
                }}
              >
                {MODEL_OPTIONS[quizModelProvider].map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleFinalQuiz}
              disabled={isLoadingFinalQuiz}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                border: "none",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {isLoadingFinalQuiz ? "Generating..." : "🏆 Final Quiz"}
            </button>
          </div>
        )}

        {showFinalQuiz && finalQuizData && (
          <QuizModal
            quiz={finalQuizData}
            courseId={course?.cid}
            chapterIndex={-1}
            onClose={() => setShowFinalQuiz(false)}
            onComplete={(result) => console.log("Final quiz result:", result)}
            modelProvider={quizModelProvider}
            modelName={quizModelName}
            onError={(err) =>
              setQuizError(
                err?.response?.data?.message ||
                  err?.message ||
                  "Failed to generate final quiz",
              )
            }
          />
        )}

        {quizError && (
          <div
            onClick={() => setQuizError(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "520px",
                background: "#0b1220",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  padding: "16px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    color: "#fca5a5",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  Final quiz generation failed
                </p>
                <button
                  type="button"
                  onClick={() => setQuizError(null)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "none",
                    color: "#9ca3af",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <p
                  style={{
                    color: "#e5e7eb",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  {quizError}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <select
                    value={quizModelProvider}
                    onChange={(e) => {
                      const nextProvider = e.target.value;
                      setQuizModelProvider(nextProvider);
                      setQuizModelName(MODEL_OPTIONS[nextProvider][0]);
                    }}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "10px",
                      background: "rgba(31,41,55,0.8)",
                      border: "1px solid rgba(75,85,99,0.5)",
                      color: "white",
                      fontSize: "12px",
                      cursor: "pointer",
                      animation: "attentionGlow 2.4s ease-in-out infinite",
                    }}
                  >
                    <option value="groq">Groq</option>
                    <option value="gemini">Gemini</option>
                  </select>
                  <select
                    value={quizModelName}
                    onChange={(e) => setQuizModelName(e.target.value)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "10px",
                      background: "rgba(31,41,55,0.8)",
                      border: "1px solid rgba(75,85,99,0.5)",
                      color: "white",
                      fontSize: "12px",
                      cursor: "pointer",
                      animation: "attentionGlow 2.4s ease-in-out infinite",
                    }}
                  >
                    {MODEL_OPTIONS[quizModelProvider].map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "16px" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQuizError(null);
                      handleFinalQuiz();
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      border: "none",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Retry with selected model
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizError(null)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e5e7eb",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseView;
