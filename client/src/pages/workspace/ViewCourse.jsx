import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getEnrolledCourseByIdApi } from "../../lib/api.js";

const ViewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["enrolledCourse", courseId],
    queryFn: async () => {
      const res = await getEnrolledCourseByIdApi(courseId);
      return res.data;
    },
  });

  const course = data?.course;
  // eslint-disable-next-line no-unused-vars
  const enrollment = data?.enrollment;

  if (isLoading) return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "center", height: "60vh",
      flexDirection: "column", gap: "16px",
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid rgba(124,58,237,0.3)",
        borderTop: "3px solid #7c3aed",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading course...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "900px" }}>

      {/* header */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1 style={{ color: "white", fontSize: isMobile ? "22px" : "28px", fontWeight: "700", marginBottom: "8px" }}>
          Course Roadmap
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Your structured learning path
        </p>
      </div>

      {/* timeline */}
      <div className="timeline-container" style={{ position: "relative", padding: "0 20px" }}>

        {/* center vertical line */}
        <div className="timeline-line" style={{
          position: "absolute",
          left: isMobile ? "20px" : "50%",
          top: 0, bottom: 0,
          width: "2px",
          background: "linear-gradient(180deg, #7c3aed, #a78bfa, #ec4899)",
          transform: isMobile ? "none" : "translateX(-50%)",
        }} />

        {course?.courseJson?.chapters?.map((chapter, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={i} className="timeline-item" style={{
              display: "flex",
              justifyContent: isMobile ? "flex-start" : (isLeft ? "flex-start" : "flex-end"),
              marginBottom: "40px",
              position: "relative",
              paddingLeft: isMobile ? "50px" : "0",
            }}>

              {/* chapter number node */}
              <div className="timeline-node" style={{
                position: "absolute",
                left: isMobile ? "20px" : "50%",
                top: "20px",
                transform: "translateX(-50%)",
                width: "36px", height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                color: "white", fontSize: "13px", fontWeight: "700",
                zIndex: 2,
                boxShadow: "0 0 0 4px #0a0f1e, 0 0 0 6px rgba(124,58,237,0.3)",
              }}>
                {i + 1}
              </div>

              {/* chapter card */}
              <div className="timeline-card" style={{
                width: isMobile ? "100%" : "42%",
                background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(109,40,217,0.1))",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: "14px",
                padding: "16px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: "20px",
                    background: "rgba(124,58,237,0.3)",
                    color: "#c4b5fd", fontSize: "11px", fontWeight: "600",
                  }}>
                    Chapter {i + 1}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: "11px" }}>
                    {chapter.duration}
                  </span>
                </div>
                <h3 style={{
                  color: "white", fontSize: "14px",
                  fontWeight: "700", marginBottom: "8px",
                }}>
                  {chapter.chapterName}
                </h3>
                <p style={{ color: "#a78bfa", fontSize: "11px" }}>
                  {chapter.topics?.length} Topics
                </p>

                {/* topics list — inline on mobile */}
                {isMobile && (
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {chapter.topics?.map((topic, j) => (
                      <div key={j} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "6px 10px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "8px",
                      }}>
                        <div style={{
                          width: "14px", height: "14px",
                          borderRadius: "50%",
                          border: "1.5px solid rgba(124,58,237,0.5)",
                          flexShrink: 0,
                        }} />
                        <span style={{ color: "#d1d5db", fontSize: "11px" }}>{topic}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* topics list — opposite side (desktop only) */}
              {!isMobile && (
                <div className="timeline-topics" style={{
                  position: "absolute",
                  width: "42%",
                  left: isLeft ? "58%" : "0%",
                  top: "0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  paddingTop: "8px",
                }}>
                  {chapter.topics?.map((topic, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "8px 12px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                    }}>
                      <div style={{
                        width: "16px", height: "16px",
                        borderRadius: "50%",
                        border: "1.5px solid rgba(124,58,237,0.5)",
                        flexShrink: 0,
                      }} />
                      <span style={{ color: "#d1d5db", fontSize: "12px" }}>{topic}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* end node + start learning button */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "16px",
          paddingTop: "20px",
        }}>
          <div style={{
            width: "56px", height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "24px",
            boxShadow: "0 0 0 4px #0a0f1e, 0 0 20px rgba(16,185,129,0.3)",
          }}>
            🎁
          </div>

          <button
            onClick={() => navigate(`/course/${courseId}`)}
            style={{
              padding: "13px 40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none", color: "white",
              fontSize: "15px", fontWeight: "600",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Learning
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ViewCourse;