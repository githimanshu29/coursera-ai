import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCourseByIdApi, generateCourseContentApi } from "../../lib/api.js";


const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await getCourseByIdApi(courseId);
      return res.data.course;
    },
  });

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      await generateCourseContentApi(courseId);
      navigate("/workspace");
    } catch (err) {
      console.error("Generate content error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

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

      {/* course info card */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "32px",
        marginBottom: "40px",
        display: "flex",
        gap: "32px",
        alignItems: "flex-start",
      }}>
        {/* banner image */}
        <div style={{
          width: "280px",
          height: "180px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(109,40,217,0.1))",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "64px",
          border: "1px solid rgba(124,58,237,0.2)",
        }}>
          📚
        </div>

        {/* course details */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            color: "white", fontSize: "24px",
            fontWeight: "700", marginBottom: "12px",
            lineHeight: "1.3",
          }}>
            {course?.name}
          </h1>
          <p style={{
            color: "#6b7280", fontSize: "14px",
            lineHeight: "1.6", marginBottom: "20px",
          }}>
            {course?.description}
          </p>

          {/* stats row */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "Duration", value: course?.courseJson?.duration || "N/A", icon: "⏱" },
              { label: "Chapters", value: course?.noOfChapters, icon: "📖" },
              { label: "Difficulty", value: course?.level, icon: "📊" },
            ].map((stat, i) => (
              <div key={i} style={{
                flex: 1, padding: "12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ fontSize: "16px" }}>{stat.icon}</span>
                <div>
                  <p style={{ color: "#6b7280", fontSize: "11px" }}>{stat.label}</p>
                  <p style={{ color: "white", fontSize: "13px", fontWeight: "600", textTransform: "capitalize" }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* generate content button */}
          <button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            style={{
              width: "100%", padding: "14px",
              borderRadius: "12px",
              background: isGenerating
                ? "rgba(124,58,237,0.5)"
                : "linear-gradient(135deg, #06b6d4, #0891b2)",
              border: "none", color: "white",
              fontSize: "15px", fontWeight: "600",
              cursor: isGenerating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "10px",
              boxShadow: "0 4px 20px rgba(6,182,212,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isGenerating) e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            {isGenerating ? (
              <>
                <span style={{
                  width: "18px", height: "18px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
                Generating Content... This may take a minute
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Content →
              </>
            )}
          </button>
        </div>
      </div>

      {/* course roadmap */}
      <div>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "700", textAlign: "center", marginBottom: "8px" }}>
          Course Roadmap
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginBottom: "40px" }}>
          Your structured learning path
        </p>

        {/* timeline */}
        <div style={{ position: "relative", padding: "0 20px" }}>

          {/* center vertical line */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: 0, bottom: 0,
            width: "2px",
            background: "linear-gradient(180deg, #7c3aed, #a78bfa, #ec4899)",
            transform: "translateX(-50%)",
          }} />

          {course?.courseJson?.chapters?.map((chapter, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} style={{
                display: "flex",
                justifyContent: isLeft ? "flex-start" : "flex-end",
                marginBottom: "40px",
                position: "relative",
              }}>

                {/* chapter number node */}
                <div style={{
                  position: "absolute",
                  left: "50%",
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
                <div style={{
                  width: "42%",
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
                </div>

                {/* topics list — opposite side */}
                <div style={{
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
              </div>
            );
          })}

          {/* end node */}
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
              onClick={handleGenerateContent}
              disabled={isGenerating}
              style={{
                padding: "12px 32px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none", color: "white",
                fontSize: "14px", fontWeight: "600",
                cursor: isGenerating ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
                opacity: isGenerating ? 0.6 : 1,
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Setup
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EditCourse;