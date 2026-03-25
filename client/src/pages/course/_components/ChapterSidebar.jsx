import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCourseQuizStatusApi } from "../../../lib/api.js";

const ChapterSidebar = ({
  course,
  enrollment,
  activeChapterIndex,
  activeTopicIndex,
  onTopicClick,
  isOpen,
  onClose,
  isMobile,
}) => {
  const navigate = useNavigate();

  const totalTopics = course?.courseJson?.chapters?.reduce(
    (acc, ch) => acc + (ch.topics?.length || 0),
    0,
  );
  const completedCount = enrollment?.completedTopics?.length || 0;
  const progress =
    totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const builtChapters =
    course?.chaptersBuilt || course?.courseContent?.filter(Boolean).length || 0;

  const handleTopicClickInternal = (chIndex, tIndex) => {
    onTopicClick(chIndex, tIndex);
    if (isMobile && onClose) onClose();
  };

  // ── quiz status query ─────────────────────────────────────
  const { data: quizStatuses } = useQuery({
    queryKey: ["quizStatus", course?.cid],
    queryFn: async () => {
      const res = await getCourseQuizStatusApi(course.cid);
      return res.data.quizzes;
    },
    enabled: !!course?.cid,
  });

  return (
    <>
      {/* mobile overlay backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 49,
          }}
        />
      )}

      <div
        style={{
          width: "300px",
          minHeight: "100vh",
          background: isMobile ? "#0a0f1e" : "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: isMobile ? (isOpen ? "0" : "-320px") : 0,
          top: 0,
          fontFamily: "'Inter', sans-serif",
          overflowY: "auto",
          zIndex: 50,
          transition: isMobile ? "left 0.3s ease" : "none",
        }}
      >
        {/* mobile close button */}
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              color: "#9ca3af",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              zIndex: 51,
            }}
          >
            ✕
          </button>
        )}

        {/* header */}
        <div
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* back button */}
          <button
            onClick={() => navigate("/workspace")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              color: "#6b7280",
              fontSize: "12px",
              cursor: "pointer",
              marginBottom: "16px",
              padding: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>

          {/* course title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                borderRadius: "8px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              📖
            </div>
            <div>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "10px",
                  marginBottom: "2px",
                }}
              >
                Course Content
              </p>
              <p
                style={{ color: "white", fontSize: "13px", fontWeight: "600" }}
              >
                {builtChapters}/{course?.courseJson?.chapters?.length} Chapters
              </p>
            </div>
          </div>

          {/* progress bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280", fontSize: "11px" }}>
                Progress
              </span>
              <span
                style={{
                  color: "#a78bfa",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
              >
                {progress}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "4px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                  borderRadius: "2px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* chapters list */}
        <div style={{ padding: "8px", flex: 1 }}>
          {course?.courseJson?.chapters?.map((chapter, chIndex) => {
            const isActiveChapter = chIndex === activeChapterIndex;
            const hasContent = chIndex < builtChapters;

            // ── quiz badge for this chapter ───────────────
            const chapterQuiz = quizStatuses?.find(
              (q) => q.chapterIndex === chIndex,
            );

            return (
              <div key={chIndex} style={{ marginBottom: "4px" }}>
                {/* chapter header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: isActiveChapter
                      ? "rgba(124,58,237,0.15)"
                      : "transparent",
                    cursor: hasContent ? "pointer" : "not-allowed",
                    opacity: hasContent ? 1 : 0.4,
                    transition: "background 0.2s",
                  }}
                  onClick={() =>
                    hasContent && handleTopicClickInternal(chIndex, 0)
                  }
                >
                  {/* chapter number circle */}
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: isActiveChapter
                        ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                        : hasContent
                          ? "rgba(34,197,94,0.2)"
                          : "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isActiveChapter
                        ? "white"
                        : hasContent
                          ? "#4ade80"
                          : "#6b7280",
                      fontSize: "11px",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    {hasContent && !isActiveChapter ? "✓" : chIndex + 1}
                  </div>

                  {/* chapter name */}
                  <p
                    style={{
                      color: isActiveChapter
                        ? "white"
                        : hasContent
                          ? "#d1d5db"
                          : "#6b7280",
                      fontSize: "12px",
                      fontWeight: isActiveChapter ? "600" : "400",
                      lineHeight: "1.4",
                      flex: 1,
                    }}
                  >
                    {chapter.chapterName}
                  </p>

                  {/* ── quiz badge ── */}
                  {chapterQuiz?.attempted && (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: "10px",
                        fontWeight: "600",
                        padding: "2px 6px",
                        borderRadius: "20px",
                        background: chapterQuiz.passed
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(248,113,113,0.15)",
                        color: chapterQuiz.passed ? "#4ade80" : "#f87171",
                      }}
                    >
                      {chapterQuiz.score}%
                    </span>
                  )}

                  {/* skipped badge */}
                  {chapterQuiz?.skipped && !chapterQuiz?.attempted && (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "20px",
                        background: "rgba(107,114,128,0.15)",
                        color: "#6b7280",
                      }}
                    >
                      skipped
                    </span>
                  )}

                  {/* locked icon */}
                  {!hasContent && (
                    <span
                      style={{
                        marginLeft: "auto",
                        color: "#374151",
                        fontSize: "10px",
                      }}
                    >
                      🔒
                    </span>
                  )}
                </div>

                {/* topics list — show when active AND has content */}
                {isActiveChapter && hasContent && (
                  <div style={{ paddingLeft: "12px", marginTop: "2px" }}>
                    {chapter.topics?.map((topic, tIndex) => {
                      const isActiveTopic = tIndex === activeTopicIndex;
                      const topicKey = `${chIndex}_${tIndex}`;
                      const isCompleted =
                        enrollment?.completedTopics?.includes(topicKey);

                      return (
                        <div
                          key={tIndex}
                          onClick={() =>
                            handleTopicClickInternal(chIndex, tIndex)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            background: isActiveTopic
                              ? "rgba(124,58,237,0.1)"
                              : "transparent",
                            transition: "background 0.2s",
                            marginBottom: "2px",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActiveTopic)
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.03)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActiveTopic)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {/* completed / active indicator */}
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              border: isCompleted
                                ? "none"
                                : isActiveTopic
                                  ? "2px solid #7c3aed"
                                  : "1.5px solid rgba(124,58,237,0.4)",
                              background: isCompleted
                                ? "#7c3aed"
                                : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {isCompleted && (
                              <svg
                                width="8"
                                height="8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="white"
                                strokeWidth="3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                            {isActiveTopic && !isCompleted && (
                              <div
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: "#7c3aed",
                                }}
                              />
                            )}
                          </div>

                          <span
                            style={{
                              color: isActiveTopic
                                ? "white"
                                : isCompleted
                                  ? "#a78bfa"
                                  : "#6b7280",
                              fontSize: "11px",
                              lineHeight: "1.4",
                            }}
                          >
                            {topic}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ChapterSidebar;
