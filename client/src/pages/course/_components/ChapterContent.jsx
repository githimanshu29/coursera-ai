/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  generateQuizApi,
  getCourseQuizStatusApi,
  retakeQuizApi,
} from "../../../lib/api.js";
import QuizModal from "./QuizModal.jsx";

const ChapterContent = ({
  course,
  activeChapterIndex,
  activeTopicIndex,
  onMarkComplete,
}) => {
  const chapter = course?.courseContent?.[activeChapterIndex];
  const chapterLayout = course?.courseJson?.chapters?.[activeChapterIndex];
  const videos = chapter?.youtubeVideo || [];
  const MODEL_OPTIONS = {
    groq: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"],
    gemini: ["gemini-2.5-flash-lite", "gemini-2.5-flash"],
  };

  const [isMobile, setIsMobile] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [showFinalQuiz, setShowFinalQuiz] = useState(false);
  const [finalQuizData, setFinalQuizData] = useState(null);
  const [isLoadingFinalQuiz, setIsLoadingFinalQuiz] = useState(false);
  const [isRetakingChapter, setIsRetakingChapter] = useState(false);
  const [isRetakingFinal, setIsRetakingFinal] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [quizModelProvider, setQuizModelProvider] = useState("groq");
  const [quizModelName, setQuizModelName] = useState(MODEL_OPTIONS.groq[1]);
  const [quizError, setQuizError] = useState(null);

  // ── derived values ────────────────────────────────────────
  const currentChapter = course?.courseJson?.chapters?.[activeChapterIndex];
  const totalTopicsInChapter = currentChapter?.topics?.length || 0;
  // const totalTopicsInChapter = chapter?.courseData?.content?.length || 0;
  const isLastTopic = activeTopicIndex === totalTopicsInChapter - 1;
  const totalChapters = course?.courseJson?.chapters?.length || 0;
  const isLastChapter = activeChapterIndex === totalChapters - 1;
  const isFullyComplete = course?.status === "READY";

  // ── quiz status query ─────────────────────────────────────
  const { data: quizStatus, refetch: refetchQuizStatus } = useQuery({
    queryKey: ["quizStatus", course?.cid],
    queryFn: async () => {
      const res = await getCourseQuizStatusApi(course.cid);
      return res.data.quizzes;
    },
    enabled: !!course?.cid,
  });

  const currentQuizStatus = quizStatus?.find(
    (q) => q.chapterIndex === activeChapterIndex,
  );

  const finalQuizStatus = quizStatus?.find((q) => q.chapterIndex === -1);

  const getQuizErrorMessage = (err) =>
    err?.response?.data?.message || err?.message || "Failed to generate quiz";

  const openQuizError = (err, type) => {
    setQuizError({
      message: getQuizErrorMessage(err),
      type,
    });
  };

  const handleOpenQuiz = async () => {
    setIsLoadingQuiz(true);
    try {
      const res = await generateQuizApi(course.cid, activeChapterIndex, {
        provider: quizModelProvider,
        model: quizModelName,
      });
      setQuizData(res.data.quiz);
      setShowQuiz(true);
    } catch (err) {
      console.error(err);
      openQuizError(err, "chapter");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleOpenFinalQuiz = async () => {
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
      openQuizError(err, "final");
    } finally {
      setIsLoadingFinalQuiz(false);
    }
  };

  const handleQuizComplete = (result) => {
    if (result?.retake) {
      // Quiz was retaken — re-open modal with new quiz
      setQuizData(result.newQuiz);
      setShowQuiz(true);
      refetchQuizStatus();
      return;
    }
    setQuizResult(result);
    refetchQuizStatus();
  };

  const handleFinalQuizComplete = (result) => {
    if (result?.retake) {
      setFinalQuizData(result.newQuiz);
      setShowFinalQuiz(true);
      refetchQuizStatus();
      return;
    }
    handleQuizComplete(result);
    setShowFinalQuiz(false);
  };

  const handleRetakeChapterQuiz = async () => {
    if (!currentQuizStatus?._id) return;
    setIsRetakingChapter(true);
    try {
      await retakeQuizApi(currentQuizStatus._id);
      const res = await generateQuizApi(course.cid, activeChapterIndex, {
        provider: quizModelProvider,
        model: quizModelName,
      });
      setQuizData(res.data.quiz);
      setShowQuiz(true);
      refetchQuizStatus();
    } catch (err) {
      console.error(err);
      openQuizError(err, "chapter");
    } finally {
      setIsRetakingChapter(false);
    }
  };

  const handleRetakeFinalQuiz = async () => {
    if (!finalQuizStatus?._id) return;
    setIsRetakingFinal(true);
    try {
      await retakeQuizApi(finalQuizStatus._id);
      const res = await generateQuizApi(course.cid, -1, {
        provider: quizModelProvider,
        model: quizModelName,
      });
      setFinalQuizData(res.data.quiz);
      setShowFinalQuiz(true);
      refetchQuizStatus();
    } catch (err) {
      console.error(err);
      openQuizError(err, "final");
    } finally {
      setIsRetakingFinal(false);
    }
  };

  const handleOpenVideo = (video) => {
    setActiveVideo(video);
    setIsVideoOpen(true);
  };

  const handleCloseVideo = () => {
    setIsVideoOpen(false);
    setActiveVideo(null);
  };

  const handleQuizProviderChange = (value) => {
    setQuizModelProvider(value);
    const nextModel = MODEL_OPTIONS[value]?.[0] || "";
    setQuizModelName(nextModel);
  };

  const handleRetryQuiz = async () => {
    if (!quizError) return;
    const retryType = quizError.type;
    setQuizError(null);
    if (retryType === "final") {
      await handleOpenFinalQuiz();
    } else {
      await handleOpenQuiz();
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!chapter)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "48px" }}>📚</div>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Select a chapter to start learning
        </p>
      </div>
    );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "860px" }}>
      <style>{`
        @keyframes attentionGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(124,58,237,0.25), 0 0 6px rgba(124,58,237,0.15); }
          50% { box-shadow: 0 0 0 1px rgba(124,58,237,0.4), 0 0 10px rgba(124,58,237,0.25); }
        }
      `}</style>
      {/* chapter badge */}
      <div style={{ marginBottom: "24px" }}>
        <span
          style={{
            padding: "5px 14px",
            borderRadius: "20px",
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#a78bfa",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          ● Chapter {activeChapterIndex + 1}
        </span>
      </div>

      {/* chapter title */}
      <h1
        style={{
          color: "white",
          fontSize: isMobile ? "22px" : "26px",
          fontWeight: "700",
          marginBottom: "32px",
          lineHeight: "1.3",
        }}
      >
        {chapterLayout?.chapterName}
      </h1>

      {/* ── Related Videos ── */}
      {videos.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.2v1.9c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 21.5 12 21.5 12 21.5s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-1.9C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z" />
              </svg>
            </div>
            <div>
              <p
                style={{ color: "white", fontSize: "15px", fontWeight: "600" }}
              >
                Related Videos
              </p>
              <p style={{ color: "#6b7280", fontSize: "12px" }}>
                Curated content to enhance your learning
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {videos.slice(0, 3).map((video, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleOpenVideo(video)}
                style={{
                  textDecoration: "none",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "border-color 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      paddingTop: "56.25%",
                      background: "#000",
                    }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(239,68,68,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        fill="white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <p
                      style={{
                        color: "#d1d5db",
                        fontSize: "11px",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {video.title}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isVideoOpen && activeVideo && (
        <div
          onClick={handleCloseVideo}
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
              maxWidth: "900px",
              background: "#0b1220",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  color: "#e5e7eb",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {activeVideo.title}
              </span>
              <button
                type="button"
                onClick={handleCloseVideo}
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
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe
                title={activeVideo.title}
                src={`https://www.youtube.com/embed/${activeVideo.videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Chapter Content ── */}
      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#a78bfa"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p style={{ color: "white", fontSize: "15px", fontWeight: "600" }}>
              Chapter Content
            </p>
            <p style={{ color: "#6b7280", fontSize: "12px" }}>
              Comprehensive learning material
            </p>
          </div>
        </div>

        {/* ── topic cards loop ── */}
        {chapter?.courseData?.content?.map((topicData, tIndex) => {
          const isActive = tIndex === activeTopicIndex;

          return (
            <div
              key={tIndex}
              style={{
                marginBottom: "32px",
                padding: isMobile ? "16px" : "24px",
                background: isActive
                  ? "rgba(124,58,237,0.05)"
                  : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "16px",
                transition: "all 0.2s",
              }}
            >
              {/* topic header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? "12px" : "0",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    {tIndex + 1}
                  </div>
                  <div>
                    <h2
                      style={{
                        color: "white",
                        fontSize: isMobile ? "16px" : "18px",
                        fontWeight: "700",
                        marginBottom: "4px",
                      }}
                    >
                      {topicData?.topic}
                    </h2>
                    <div
                      style={{
                        width: "40px",
                        height: "3px",
                        background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>

                {/* AI Assistant button */}
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "#a78bfa",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(124,58,237,0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(124,58,237,0.1)")
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  AI Assistant
                </button>
              </div>

              {/* html content */}
              <div
                className="study-content"
                dangerouslySetInnerHTML={{ __html: topicData?.htmlContent }}
              />

              {/* mark complete button */}
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => onMarkComplete(activeChapterIndex, tIndex)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    color: "#34d399",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(16,185,129,0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(16,185,129,0.1)")
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Mark as Complete
                </button>
              </div>
            </div>
          );
        })}

        {/* ── CHAPTER QUIZ — only after last topic ── */}
        {isLastTopic && (
          <div
            id="chapter-quiz-section"
            style={{ marginTop: "8px", marginBottom: "16px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <select
                value={quizModelProvider}
                onChange={(e) => handleQuizProviderChange(e.target.value)}
                disabled={isLoadingQuiz || isRetakingChapter || isRetakingFinal}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  background: "rgba(31,41,55,0.8)",
                  border: "1px solid rgba(75,85,99,0.5)",
                  color: "white",
                  fontSize: "12px",
                  outline: "none",
                  cursor: "pointer",
                  animation: "attentionGlow 2.4s ease-in-out infinite",
                  opacity:
                    isLoadingQuiz || isRetakingChapter || isRetakingFinal
                      ? 0.6
                      : 1,
                }}
              >
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
              </select>
              <select
                value={quizModelName}
                onChange={(e) => setQuizModelName(e.target.value)}
                disabled={isLoadingQuiz || isRetakingChapter || isRetakingFinal}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  background: "rgba(31,41,55,0.8)",
                  border: "1px solid rgba(75,85,99,0.5)",
                  color: "white",
                  fontSize: "12px",
                  outline: "none",
                  cursor: "pointer",
                  animation: "attentionGlow 2.4s ease-in-out infinite",
                  opacity:
                    isLoadingQuiz || isRetakingChapter || isRetakingFinal
                      ? 0.6
                      : 1,
                }}
              >
                {MODEL_OPTIONS[quizModelProvider].map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            {currentQuizStatus?.attempted ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: currentQuizStatus.passed
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(248,113,113,0.08)",
                  border: `1px solid ${
                    currentQuizStatus.passed
                      ? "rgba(34,197,94,0.2)"
                      : "rgba(248,113,113,0.2)"
                  }`,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: "24px" }}>
                    {currentQuizStatus.passed ? "🏆" : "📝"}
                  </span>
                  <div>
                    <p
                      style={{
                        color: currentQuizStatus.passed ? "#4ade80" : "#f87171",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Chapter Quiz: {currentQuizStatus.score}%
                      {currentQuizStatus.passed
                        ? " — Passed!"
                        : " — Not passed"}
                    </p>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {currentQuizStatus.passed
                        ? "Badge earned for this chapter ✓"
                        : "Score 80%+ to earn the chapter badge"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRetakeChapterQuiz}
                  disabled={isRetakingChapter}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "10px",
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: "#a78bfa",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: isRetakingChapter ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isRetakingChapter) {
                      e.currentTarget.style.background = "rgba(124,58,237,0.2)";
                      e.currentTarget.style.borderColor =
                        "rgba(124,58,237,0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,0.1)";
                    e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)";
                  }}
                >
                  {isRetakingChapter ? (
                    <>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
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
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Retake Quiz
                    </>
                  )}
                </button>
              </div>
            ) : currentQuizStatus?.skipped ? (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p style={{ color: "#6b7280", fontSize: "13px" }}>
                  Quiz skipped for this chapter.
                  <button
                    onClick={handleOpenQuiz}
                    style={{
                      marginLeft: "8px",
                      background: "transparent",
                      border: "none",
                      color: "#a78bfa",
                      fontSize: "13px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Take it now?
                  </button>
                </p>
              </div>
            ) : (
              <button
                onClick={handleOpenQuiz}
                disabled={isLoadingQuiz}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "#a78bfa",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isLoadingQuiz ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(124,58,237,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(124,58,237,0.12)")
                }
              >
                {isLoadingQuiz ? (
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
                    Generating quiz...
                  </>
                ) : (
                  <>📝 Take Chapter Quiz</>
                )}
              </button>
            )}
          </div>
        )}

        {/* ── FINAL QUIZ — only on last topic of last chapter ── */}
        {isLastTopic && isLastChapter && isFullyComplete && (
          <div
            id="final-quiz-section"
            style={{
              marginTop: "24px",
              padding: "20px 24px",
              borderRadius: "16px",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            {finalQuizStatus?.attempted ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: "32px" }}>
                    {finalQuizStatus.passed ? "🎓" : "📋"}
                  </span>
                  <div>
                    <p
                      style={{
                        color: finalQuizStatus.passed ? "#4ade80" : "#f87171",
                        fontSize: "16px",
                        fontWeight: "700",
                      }}
                    >
                      Final Quiz: {finalQuizStatus.score}%
                      {finalQuizStatus.passed
                        ? " — Course Completed!"
                        : " — Not passed"}
                    </p>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {finalQuizStatus.passed
                        ? "You've mastered this course!"
                        : "Score 80%+ to earn the course completion badge"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRetakeFinalQuiz}
                  disabled={isRetakingFinal}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: "#a78bfa",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: isRetakingFinal ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isRetakingFinal) {
                      e.currentTarget.style.background = "rgba(124,58,237,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,0.1)";
                  }}
                >
                  {isRetakingFinal ? (
                    <>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
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
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Retake Final Quiz
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    Course Complete — Take the Final Quiz!
                  </p>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    Test your knowledge across the entire course. Score 80%+ to
                    earn the course badge.
                  </p>
                </div>
                <button
                  onClick={handleOpenFinalQuiz}
                  disabled={isLoadingFinalQuiz}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isLoadingFinalQuiz ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isLoadingFinalQuiz ? "Generating..." : "🏆 Take Final Quiz"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {quizError && (
        <div
          onClick={() => setQuizError(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 250,
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
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#fca5a5",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  Quiz generation failed
                </p>
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {quizError.type === "final" ? "Final quiz" : "Chapter quiz"}{" "}
                  could not be created.
                </p>
              </div>
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
                {quizError.message}
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
                  onChange={(e) => handleQuizProviderChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "rgba(31,41,55,0.8)",
                    border: "1px solid rgba(75,85,99,0.5)",
                    color: "white",
                    fontSize: "12px",
                    outline: "none",
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
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "rgba(31,41,55,0.8)",
                    border: "1px solid rgba(75,85,99,0.5)",
                    color: "white",
                    fontSize: "12px",
                    outline: "none",
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
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={handleRetryQuiz}
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

      {/* quiz modals */}
      {showQuiz && quizData && (
        <QuizModal
          quiz={quizData}
          courseId={course?.cid}
          chapterIndex={activeChapterIndex}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
          modelProvider={quizModelProvider}
          modelName={quizModelName}
          onError={(err) => openQuizError(err, "chapter")}
        />
      )}

      {showFinalQuiz && finalQuizData && (
        <QuizModal
          quiz={finalQuizData}
          courseId={course?.cid}
          chapterIndex={-1}
          onClose={() => setShowFinalQuiz(false)}
          onComplete={handleFinalQuizComplete}
          modelProvider={quizModelProvider}
          modelName={quizModelName}
          onError={(err) => openQuizError(err, "final")}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ChapterContent;
