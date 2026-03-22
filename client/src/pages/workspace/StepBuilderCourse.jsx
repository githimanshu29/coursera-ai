import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCourseByIdApi, createChapterRAGStream } from "../../lib/api.js";
import LiveBuildWindow from "./_components/LiveBuildWindow.jsx";
import { enrollCourseApi } from "../../lib/api.js";

const StepBuildCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [embeddingProgress, setEmbeddingProgress] = useState(null);
  const [userInstruction, setUserInstruction] = useState("");
  const [extraChaptersBuilt, setExtraChaptersBuilt] = useState(0);

  const [eventSource, setEventSource] = useState(null);

  const {
    data: course,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await getCourseByIdApi(courseId);
      return res.data.course;
    },
  });

  const chaptersBuilt = (course?.chaptersBuilt || 0) + extraChaptersBuilt;

  // cleanup SSE on unmount
  useEffect(() => {
    return () => eventSource?.close();
  }, [eventSource]);

  const totalChapters = course?.courseJson?.chapters?.length || 0;
  const isComplete = course?.status === "READY";
  const currentChapterName =
    course?.courseJson?.chapters?.[chaptersBuilt]?.chapterName;

  const addLog = (type, message) => {
    setLogs((prev) => [
      ...prev,
      { type, message, time: new Date().toLocaleTimeString() },
    ]);
  };

  const handleGenerateNextChapter = async () => {
    if (isGenerating || isComplete) return;

    setIsGenerating(true);
    setEmbeddingProgress(null);
    addLog(
      "status",
      `Starting chapter ${chaptersBuilt + 1}/${totalChapters}: "${currentChapterName}"`,
    );
    if (userInstruction) addLog("status", `Instruction: "${userInstruction}"`);

    const es = await createChapterRAGStream(courseId, userInstruction);
    setEventSource(es);

    es.addEventListener("status", (e) => {
      const data = JSON.parse(e.data);
      addLog("status", data.message);
    });

    es.addEventListener("progress", (e) => {
      const data = JSON.parse(e.data);
      addLog("status", data.message);
      if (data.progress === 50) {
        setEmbeddingProgress({ stored: 0, total: 5 });
      }
      if (data.progress === 75) {
        setEmbeddingProgress((prev) =>
          prev ? { ...prev, stored: prev.total } : null,
        );
      }
    });

    es.addEventListener("done", (e) => {
      const data = JSON.parse(e.data);
      setIsGenerating(false);
      setUserInstruction("");
      setExtraChaptersBuilt((prev) => prev + 1);

      addLog("done", `Chapter ${data.chapterIndex + 1} complete!`);
      addLog(
        "done",
        `Topics: ${data.topicsGenerated} | Chunks: ${data.chunksStored} | Videos: ${data.videosFound}`,
      );

      if (data.isLastChapter) {
        addLog("done", "All chapters complete! Enrolling you now...");

        // ✅ auto enroll when course is complete
        enrollCourseApi(courseId)
          .then(() => {
            queryClient.invalidateQueries(["userCourses"]);
            queryClient.invalidateQueries(["enrolledCourses"]);
            queryClient.invalidateQueries(["course", courseId]);
            addLog("done", "Enrolled! Go to Dashboard to start learning.");
          })
          .catch(() => {
            addLog("status", "Course ready! Go to Dashboard to enroll.");
          });
      }

      refetch();
      es.close();
    });
    es.addEventListener("error", (e) => {
      setIsGenerating(false);
      try {
        const data = JSON.parse(e.data);
        addLog("error", data.message);
      } catch {
        addLog("error", "Connection error occurred");
      }
      es.close();
    });
  };

  if (isLoading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "800px" }}>
      {/* header */}
      <div style={{ marginBottom: "28px" }}>
        <button
          onClick={() => navigate("/workspace")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "none",
            color: "#6b7280",
            fontSize: "13px",
            cursor: "pointer",
            marginBottom: "16px",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
        >
          ← Back to Dashboard
        </button>

        <h1
          style={{
            color: "white",
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "6px",
          }}
        >
          {course?.name}
        </h1>
        <p style={{ color: "#6b7280", fontSize: "13px" }}>
          Step-by-step AI generation with RAG context
        </p>
      </div>

      {/* chapter progress grid */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {course?.courseJson?.chapters?.map((chapter, i) => {
            const isBuilt = i < chaptersBuilt;
            const isCurrent = i === chaptersBuilt;
            const isLocked = i > chaptersBuilt;

            return (
              <div
                key={i}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: isBuilt
                    ? "rgba(34,197,94,0.08)"
                    : isCurrent
                      ? "rgba(124,58,237,0.12)"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    isBuilt
                      ? "rgba(34,197,94,0.2)"
                      : isCurrent
                        ? "rgba(124,58,237,0.3)"
                        : "rgba(255,255,255,0.06)"
                  }`,
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: isBuilt
                        ? "#4ade80"
                        : isCurrent
                          ? "#7c3aed"
                          : "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      color: "white",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    {isBuilt ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      color: isBuilt
                        ? "#4ade80"
                        : isCurrent
                          ? "#a78bfa"
                          : "#374151",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {isBuilt ? "DONE" : isCurrent ? "NEXT" : "LOCKED"}
                  </span>
                </div>
                <p
                  style={{
                    color: isLocked ? "#374151" : "#d1d5db",
                    fontSize: "11px",
                    lineHeight: "1.4",
                  }}
                >
                  {chapter.chapterName}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* completion state */}
      {isComplete ? (
        <div
          style={{
            padding: "24px",
            borderRadius: "16px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
          <h3
            style={{
              color: "#4ade80",
              fontSize: "18px",
              fontWeight: "700",
              marginBottom: "8px",
            }}
          >
            Course Complete!
          </h3>
          <p
            style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}
          >
            All {totalChapters} chapters generated successfully.
          </p>
          <button
            onClick={() => navigate("/workspace")}
            style={{
              padding: "10px 28px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Go to Dashboard → Enroll
          </button>
        </div>
      ) : (
        <>
          {/* user instruction input */}
          {chaptersBuilt > 0 && !isComplete && (
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {chaptersBuilt} chapter
                  {chaptersBuilt > 1 ? "s" : ""} ready to study
                </p>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    marginTop: "2px",
                  }}
                >
                  You can study while building the rest
                </p>
              </div>
              <button
                onClick={() => navigate(`/workspace/view-course/${courseId}`)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  color: "#a78bfa",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                📖 Study So Far
              </button>
            </div>
          )}

          {/* user instruction input */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#9ca3af",
                fontSize: "12px",
                fontWeight: "500",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Customize this chapter (optional)
            </label>
            <input
              type="text"
              placeholder='e.g. "add more code examples" or "explain in simpler language"'
              value={userInstruction}
              onChange={(e) => setUserInstruction(e.target.value)}
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(31,41,55,0.8)",
                border: "1px solid rgba(75,85,99,0.5)",
                color: "white",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                opacity: isGenerating ? 0.5 : 1,
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(124,58,237,0.7)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(75,85,99,0.5)")
              }
            />
          </div>

          {/* generate button */}
          <button
            onClick={handleGenerateNextChapter}
            disabled={isGenerating}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "12px",
              background: isGenerating
                ? "rgba(124,58,237,0.4)"
                : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isGenerating ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
              boxShadow: isGenerating
                ? "none"
                : "0 4px 20px rgba(124,58,237,0.3)",
              transition: "all 0.2s",
            }}
          >
            {isGenerating ? (
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
                Generating Chapter {chaptersBuilt + 1}...
              </>
            ) : (
              <>
                ⚡ Generate Chapter {chaptersBuilt + 1}/{totalChapters}
                {currentChapterName && (
                  <span
                    style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}
                  >
                    — "{currentChapterName}"
                  </span>
                )}
              </>
            )}
          </button>
        </>
      )}

      {/* live build window */}
      {logs.length > 0 && (
        <LiveBuildWindow
          logs={logs}
          embeddingProgress={embeddingProgress}
          isGenerating={isGenerating}
          currentChapter={chaptersBuilt}
          totalChapters={totalChapters}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default StepBuildCourse;
