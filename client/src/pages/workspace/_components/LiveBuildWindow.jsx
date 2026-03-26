import { useEffect, useRef, useState } from "react";

const LiveBuildWindow = ({
  logs,
  embeddingProgress,
  isGenerating,
  currentChapter,
  totalChapters,
}) => {
  const logsEndRef = useRef(null);
  const [dots, setDots] = useState("");

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Animated dots for the "generating" state
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

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

  // Deduplicate consecutive identical messages
  const dedupedLogs = logs.reduce((acc, log, i) => {
    if (i === 0 || log.message !== logs[i - 1].message) {
      acc.push({ ...log, count: 1 });
    } else {
      acc[acc.length - 1].count += 1;
    }
    return acc;
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(13,19,33,0.9) 100%)",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: "16px",
        padding: "20px",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: "12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated gradient border glow when generating */}
      {isGenerating && (
        <div
          style={{
            position: "absolute",
            inset: "-1px",
            borderRadius: "16px",
            background: "conic-gradient(from var(--angle, 0deg), #7c3aed, #a78bfa, #ec4899, #7c3aed)",
            opacity: 0.25,
            zIndex: 0,
            animation: "borderRotate 3s linear infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
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
                gap: "8px",
              }}
            >
              {/* Animated pulse dots */}
              <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "#a78bfa",
                      animation: `buildPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span style={{ color: "#a78bfa", fontSize: "11px", fontWeight: "600" }}>
                processing
              </span>
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
              <span style={{ color: "#9ca3af", fontSize: "11px" }}>
                Chapter {currentChapter}/{totalChapters}
              </span>
              <span style={{ color: "#a78bfa", fontWeight: "600", fontSize: "11px" }}>
                {Math.round((currentChapter / totalChapters) * 100)}%
              </span>
            </div>
            <div
              style={{
                height: "4px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(currentChapter / totalChapters) * 100}%`,
                  background: "linear-gradient(90deg, #7c3aed, #a78bfa, #c084fc)",
                  borderRadius: "3px",
                  transition: "width 0.5s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* shimmer effect */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "progressShimmer 1.8s ease-in-out infinite",
                }} />
              </div>
            </div>
          </div>
        )}

        {/* logs */}
        <div
          style={{
            maxHeight: "260px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            padding: "4px 0",
          }}
        >
          {dedupedLogs.length === 0 && (
            <span style={{ color: "#374151" }}>Waiting to start...</span>
          )}
          {dedupedLogs.map((log, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
                padding: "3px 6px",
                borderRadius: "6px",
                background: i === dedupedLogs.length - 1 && isGenerating
                  ? "rgba(124,58,237,0.06)"
                  : "transparent",
                animation: i === dedupedLogs.length - 1 ? "logFadeIn 0.3s ease" : "none",
              }}
            >
              <span
                style={{
                  color: getStepColor(log.type),
                  flexShrink: 0,
                  marginTop: "1px",
                  fontSize: "11px",
                }}
              >
                {getStepIcon(log.type)}
              </span>
              <span
                style={{
                  color: log.type === "error" ? "#f87171" : "#d1d5db",
                  fontSize: "11.5px",
                  lineHeight: "1.5",
                }}
              >
                {log.message}
                {log.count > 1 && (
                  <span style={{
                    marginLeft: "8px",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    background: "rgba(124,58,237,0.15)",
                    color: "#a78bfa",
                    fontSize: "10px",
                    fontWeight: "600",
                  }}>
                    ×{log.count}
                  </span>
                )}
              </span>
            </div>
          ))}

          {/* Active processing indicator (replaces repetitive messages) */}
          {isGenerating && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                padding: "6px",
                marginTop: "4px",
              }}
            >
              <div style={{
                width: "14px", height: "14px",
                border: "2px solid rgba(167,139,250,0.3)",
                borderTop: "2px solid #a78bfa",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ color: "#a78bfa", fontSize: "11px", fontStyle: "italic" }}>
                AI is generating{dots}
              </span>
            </div>
          )}

          {/* embedding progress bar */}
          {embeddingProgress && isGenerating && (
            <div style={{ marginTop: "4px", padding: "4px 6px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  color: "#6b7280",
                  fontSize: "11px",
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
      </div>

      <style>{`
        @keyframes buildPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes logFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes progressShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes borderRotate {
          to { --angle: 360deg; }
        }
      `}</style>
    </div>
  );
};

export default LiveBuildWindow;
