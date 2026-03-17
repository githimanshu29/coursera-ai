/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";

const ChapterContent = ({ course, activeChapterIndex, activeTopicIndex, onMarkComplete }) => {
  const chapter = course?.courseContent?.[activeChapterIndex];
  const chapterLayout = course?.courseJson?.chapters?.[activeChapterIndex];
  const topicContent = chapter?.courseData?.content?.[activeTopicIndex];
  const videos = chapter?.youtubeVideo || [];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!chapter) return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "center", height: "60vh",
      flexDirection: "column", gap: "12px",
    }}>
      <div style={{ fontSize: "48px" }}>📚</div>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Select a chapter to start learning
      </p>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "860px" }}>

      {/* chapter badge */}
      <div style={{ marginBottom: "24px" }}>
        <span style={{
          padding: "5px 14px", borderRadius: "20px",
          background: "rgba(124,58,237,0.15)",
          border: "1px solid rgba(124,58,237,0.3)",
          color: "#a78bfa", fontSize: "12px", fontWeight: "600",
        }}>
          ● Chapter {activeChapterIndex + 1}
        </span>
      </div>

      {/* chapter title */}
      <h1 style={{
        color: "white", fontSize: isMobile ? "22px" : "26px",
        fontWeight: "700", marginBottom: "32px",
        lineHeight: "1.3",
      }}>
        {chapterLayout?.chapterName}
      </h1>

      {/* ── Related Videos ── */}
      {videos.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              width: "32px", height: "32px",
              borderRadius: "8px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.2)",
              display: "flex", alignItems: "center",
              justifyContent: "center",
            }}>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
  <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.2v1.9c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 21.5 12 21.5 12 21.5s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-1.9C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z"/>
</svg>
            </div>
            <div>
              <p style={{ color: "white", fontSize: "15px", fontWeight: "600" }}>Related Videos</p>
              <p style={{ color: "#6b7280", fontSize: "12px" }}>Curated content to enhance your learning</p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "12px",
          }}>
            {videos.slice(0, 3).map((video, i) => (
              <a
                key={i}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "border-color 0.2s, transform 0.2s",
                  cursor: "pointer",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* thumbnail */}
                  <div style={{
                    position: "relative",
                    paddingTop: "56.25%",
                    background: "#000",
                  }}>
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title}
                      style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "100%", height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {/* play button overlay */}
                    <div style={{
                      position: "absolute",
                      top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "36px", height: "36px",
                      borderRadius: "50%",
                      background: "rgba(239,68,68,0.9)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* title */}
                  <div style={{
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.02)",
                  }}>
                    <p style={{
                      color: "#d1d5db", fontSize: "11px",
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {video.title}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Chapter Content ── */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <div style={{
            width: "32px", height: "32px",
            borderRadius: "8px",
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.2)",
            display: "flex", alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p style={{ color: "white", fontSize: "15px", fontWeight: "600" }}>Chapter Content</p>
            <p style={{ color: "#6b7280", fontSize: "12px" }}>Comprehensive learning material</p>
          </div>
        </div>

        {/* topic content */}
        {chapter?.courseData?.content?.map((topicData, tIndex) => {
          const isActive = tIndex === activeTopicIndex;
          const topicKey = `${activeChapterIndex}_${tIndex}`;

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
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "flex-start",
                marginBottom: "16px",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "12px" : "0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "28px", height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    color: "white", fontSize: "12px", fontWeight: "700",
                    flexShrink: 0,
                  }}>
                    {tIndex + 1}
                  </div>
                  <div>
                    <h2 style={{
                      color: "white", fontSize: isMobile ? "16px" : "18px",
                      fontWeight: "700", marginBottom: "4px",
                    }}>
                      {topicData?.topic}
                    </h2>
                    <div style={{
                      width: "40px", height: "3px",
                      background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                      borderRadius: "2px",
                    }} />
                  </div>
                </div>

                {/* AI Assistant button */}
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 12px", borderRadius: "8px",
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "#a78bfa", fontSize: "12px",
                    cursor: "pointer", transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(124,58,237,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(124,58,237,0.1)"}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  AI Assistant
                </button>
              </div>

              {/* html content — with study-content class for enhanced typography */}
              <div
                className="study-content"
                dangerouslySetInnerHTML={{ __html: topicData?.htmlContent }}
              />

              {/* mark complete button */}
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => onMarkComplete(activeChapterIndex, tIndex)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 16px", borderRadius: "8px",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    color: "#34d399", fontSize: "12px",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Complete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChapterContent;