import { useEffect, useRef } from "react";

const LiveBuildWindow = ({
  logs,
  embeddingProgress,
  isGenerating,
  currentChapter,
  totalChapters,
}) => {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getStepIcon = (type) => {
    if (type === "done") return "✓";
    if (type === "error") return "✗";
    if (type === "embedding") return "◈";
    return "→";
  };

  const getStepColor = (type) => {
    if (type === "done") return "#4ade80";
    if (type === "error") return "#f87171";
    if (type === "embedding") return "#a78bfa";
    return "#6b7280";
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.4)",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: "16px",
        padding: "20px",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: "12px",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* terminal dots */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["#f87171", "#facc15", "#4ade80"].map((c, i) => (
            <div
              key={i}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <span style={{ color: "#6b7280", fontSize: "11px" }}>
          coursera-ai — chapter builder
        </span>
        {isGenerating && (
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#a78bfa",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <span style={{ color: "#a78bfa", fontSize: "11px" }}>running</span>
          </div>
        )}
      </div>

      {/* chapter progress */}
      {totalChapters > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span style={{ color: "#6b7280" }}>
              Chapter {currentChapter}/{totalChapters}
            </span>
            <span style={{ color: "#a78bfa" }}>
              {Math.round((currentChapter / totalChapters) * 100)}%
            </span>
          </div>
          <div
            style={{
              height: "3px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(currentChapter / totalChapters) * 100}%`,
                background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                borderRadius: "2px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* logs */}
      <div
        style={{
          maxHeight: "280px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {logs.length === 0 && (
          <span style={{ color: "#374151" }}>Waiting to start...</span>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: getStepColor(log.type),
                flexShrink: 0,
                marginTop: "1px",
              }}
            >
              {getStepIcon(log.type)}
            </span>
            <span
              style={{ color: log.type === "error" ? "#f87171" : "#d1d5db" }}
            >
              {log.message}
            </span>
          </div>
        ))}

        {/* embedding progress bar */}
        {embeddingProgress && isGenerating && (
          <div style={{ marginTop: "4px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                color: "#6b7280",
              }}
            >
              <span>Storing vectors...</span>
              <span style={{ color: "#a78bfa" }}>
                {embeddingProgress.stored}/{embeddingProgress.total}
              </span>
            </div>
            <div
              style={{
                height: "3px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(embeddingProgress.stored / embeddingProgress.total) * 100}%`,
                  background: "#a78bfa",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        <div ref={logsEndRef} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LiveBuildWindow;
