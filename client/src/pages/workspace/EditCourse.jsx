import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { getCourseByIdApi, generateCourseContentApi } from "../../lib/api.js";

/* ── tiny hook: fade-in on scroll ── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/* ── Chapter Card sub-component ── */
const RoadmapChapterCard = ({ chapter, index, side }) => {
  const [hovered, setHovered] = useState(false);
  const [ref, visible] = useInView(0.1);

  const colors = [
    { bg: "rgba(124,58,237,0.14)", border: "rgba(124,58,237,0.32)", accent: "#a78bfa", glow: "rgba(124,58,237,0.25)" },
    { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.30)", accent: "#93c5fd", glow: "rgba(96,165,250,0.20)" },
    { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.28)", accent: "#6ee7b7", glow: "rgba(52,211,153,0.20)" },
    { bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.28)", accent: "#fdba74", glow: "rgba(251,146,60,0.20)" },
    { bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.28)", accent: "#f9a8d4", glow: "rgba(244,114,182,0.20)" },
  ];
  const c = colors[index % colors.length];

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${c.bg}, rgba(15,18,32,0.95))`
          : `linear-gradient(145deg, ${c.bg}, rgba(10,15,30,0.85))`,
        border: `1px solid ${hovered ? c.accent + "55" : c.border}`,
        borderRadius: "18px",
        padding: "20px 22px",
        transition: "all 0.4s cubic-bezier(.25,.8,.25,1)",
        transform: visible
          ? hovered ? "translateY(-3px) scale(1.01)" : "translateY(0)"
          : `translateX(${side === "left" ? "-30px" : "30px"})`,
        opacity: visible ? 1 : 0,
        boxShadow: hovered
          ? `0 14px 36px ${c.glow}, 0 0 0 1px ${c.accent}22`
          : "0 4px 16px rgba(0,0,0,0.12)",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: `linear-gradient(120deg, transparent, ${c.accent}08, transparent)`,
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
        <span style={{
          padding: "3px 11px", borderRadius: "20px",
          background: `${c.accent}20`, border: `1px solid ${c.accent}35`,
          color: c.accent, fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px",
        }}>
          Chapter {index + 1}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280", fontSize: "11px" }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {chapter.duration}
        </span>
      </div>
      <h3 style={{ color: "white", fontSize: "15px", fontWeight: "700", marginBottom: "8px", lineHeight: "1.4" }}>
        {chapter.chapterName}
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: c.accent, fontSize: "12px", fontWeight: "600" }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        {chapter.topics?.length} Topics
      </div>
    </div>
  );
};

/* ── Topic Item sub-component ── */
const RoadmapTopicItem = ({ topic, index: topicIdx, chapterIndex, side }) => {
  const [hovered, setHovered] = useState(false);
  const [ref, visible] = useInView(0.05);
  const colors = ["#a78bfa", "#93c5fd", "#6ee7b7", "#fdba74", "#f9a8d4"];
  const accent = colors[chapterIndex % colors.length];

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 13px",
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
        border: `1px solid ${hovered ? accent + "30" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "10px",
        transition: "all 0.3s ease",
        transform: visible
          ? hovered ? "translateX(4px)" : "translateX(0)"
          : `translateX(${side === "right" ? "25px" : "-25px"})`,
        opacity: visible ? 1 : 0,
        transitionDelay: `${topicIdx * 50}ms`,
        cursor: "default",
      }}
    >
      <div style={{
        width: "16px", height: "16px", borderRadius: "50%",
        border: `2px solid ${hovered ? accent : accent + "55"}`,
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s ease", background: hovered ? accent + "15" : "transparent",
      }}>
        {hovered && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: accent }} />}
      </div>
      <span style={{
        color: hovered ? "#e5e7eb" : "#9ca3af", fontSize: "12px",
        lineHeight: "1.4", transition: "color 0.3s ease",
      }}>
        {topic}
      </span>
    </div>
  );
};


const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkMedia = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth > 640 && window.innerWidth <= 1024);
    };
    checkMedia();
    window.addEventListener("resize", checkMedia);
    return () => window.removeEventListener("resize", checkMedia);
  }, []);

  const useLinearLayout = isMobile || isTablet;

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
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading course...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "1000px", margin: "0 auto", padding: isMobile ? "20px 8px" : "20px" }}>
      {/* Scoped styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes edit-fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes edit-pulseGlow {
          0%, 100% { box-shadow: 0 0 0 4px rgba(10,15,30,1), 0 0 0 7px rgba(124,58,237,0.2); }
          50%       { box-shadow: 0 0 0 4px rgba(10,15,30,1), 0 0 0 7px rgba(124,58,237,0.45); }
        }
        @keyframes edit-lineGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      `}</style>

      {/* course info card */}
      <div
        className="course-info-card"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: isMobile ? "20px" : "32px",
          marginBottom: "40px",
          display: "flex",
          gap: isMobile ? "20px" : "32px",
          alignItems: "flex-start",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* banner image */}
        <div
          className="course-banner-img"
          style={{
            width: isMobile ? "100%" : "280px",
            height: isMobile ? "160px" : "180px",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(109,40,217,0.1))",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "64px",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          📚
        </div>

        {/* course details */}
        <div style={{ flex: 1, width: "100%" }}>
          <h1
            style={{
              color: "white",
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: "700",
              marginBottom: "12px",
              lineHeight: "1.3",
            }}
          >
            {course?.name}
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            {course?.description}
          </p>

          {/* stats row */}
          <div
            className="stats-row"
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "24px",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            {[
              {
                label: "Duration",
                value: course?.courseJson?.duration || "N/A",
                icon: "⏱",
              },
              { label: "Chapters", value: course?.noOfChapters, icon: "📖" },
              { label: "Difficulty", value: course?.level, icon: "📊" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "16px" }}>{stat.icon}</span>
                <div>
                  <p style={{ color: "#6b7280", fontSize: "11px" }}>
                    {stat.label}
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* generation options */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {/* option 1 — all at once */}
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              style={{
                flex: 1,
                minWidth: "180px",
                padding: "13px",
                borderRadius: "12px",
                background: isGenerating
                  ? "rgba(8,145,178,0.3)"
                  : "linear-gradient(135deg, #06b6d4, #0891b2)",
                border: "none",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isGenerating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(6,182,212,0.2)",
              }}
            >
              {isGenerating ? (
                <>
                  <span
                    style={{
                      width: "15px",
                      height: "15px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Generating...
                </>
              ) : (
                <>⚡ Generate All at Once</>
              )}
            </button>

            {/* option 2 — step by step */}
            <button
              onClick={() => navigate(`/workspace/step-build/${courseId}`)}
              disabled={isGenerating}
              style={{
                flex: 1,
                minWidth: "180px",
                padding: "13px",
                borderRadius: "12px",
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isGenerating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(124,58,237,0.25)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(124,58,237,0.15)")
              }
            >
              🧠 Build Step by Step (RAG)
            </button>
          </div>
        </div>
      </div>

      {/* course roadmap — same style as ViewCourse */}
      <div>
        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center", animation: "edit-fadeIn 0.6s ease forwards" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "30px",
            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.22)",
            marginBottom: "16px", fontSize: "12px",
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span style={{ color: "#a78bfa", fontWeight: "600", letterSpacing: "0.3px" }}>
              Course Roadmap
            </span>
          </div>

          <h2 style={{ color: "white", fontSize: isMobile ? "22px" : "28px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Your Structured Learning Path
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            {course?.courseJson?.chapters?.length} chapters to master
          </p>
        </div>

        {/* timeline */}
        <div style={{ position: "relative" }}>
          {/* center / left vertical line */}
          <div style={{
            position: "absolute",
            left: useLinearLayout ? "24px" : "50%",
            top: 0, bottom: 0, width: "3px", borderRadius: "3px",
            background: "linear-gradient(180deg, #7c3aed 0%, #a78bfa 40%, #ec4899 75%, #6366f1 100%)",
            transform: useLinearLayout ? "none" : "translateX(-50%)",
            transformOrigin: "top",
            animation: "edit-lineGrow 1.2s ease forwards",
            opacity: 0.65,
          }} />

          {/* chapter rows */}
          {course?.courseJson?.chapters?.map((chapter, i) => {
            const isLeft = i % 2 === 0;

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: useLinearLayout ? "1fr" : "1fr 1fr",
                  gap: useLinearLayout ? "12px" : "80px",
                  marginBottom: isMobile ? "36px" : "48px",
                  position: "relative",
                  paddingLeft: useLinearLayout ? "56px" : "0",
                }}
              >
                {/* timeline node */}
                <div style={{
                  position: "absolute",
                  left: useLinearLayout ? "24px" : "50%",
                  top: "18px",
                  transform: "translate(-50%, 0)",
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "15px", fontWeight: "800", zIndex: 3,
                  animation: "edit-pulseGlow 3s ease-in-out infinite",
                  animationDelay: `${i * 0.3}s`,
                }}>
                  {i + 1}
                </div>

                {/* Desktop two-column layout */}
                {!useLinearLayout && (
                  <>
                    {/* LEFT COLUMN */}
                    <div style={{
                      display: "flex", flexDirection: "column", gap: "8px",
                      alignItems: "flex-end", paddingRight: "20px",
                    }}>
                      {isLeft ? (
                        <div style={{ width: "100%", maxWidth: "380px" }}>
                          <RoadmapChapterCard chapter={chapter} index={i} side="left" />
                        </div>
                      ) : (
                        <div style={{
                          width: "100%", maxWidth: "380px",
                          display: "flex", flexDirection: "column", gap: "8px", paddingTop: "6px",
                        }}>
                          {chapter.topics?.map((topic, j) => (
                            <RoadmapTopicItem key={j} topic={topic} index={j} chapterIndex={i} side="left" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{
                      display: "flex", flexDirection: "column", gap: "8px",
                      alignItems: "flex-start", paddingLeft: "20px",
                    }}>
                      {isLeft ? (
                        <div style={{
                          width: "100%", maxWidth: "380px",
                          display: "flex", flexDirection: "column", gap: "8px", paddingTop: "6px",
                        }}>
                          {chapter.topics?.map((topic, j) => (
                            <RoadmapTopicItem key={j} topic={topic} index={j} chapterIndex={i} side="right" />
                          ))}
                        </div>
                      ) : (
                        <div style={{ width: "100%", maxWidth: "380px" }}>
                          <RoadmapChapterCard chapter={chapter} index={i} side="right" />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Mobile / Tablet single-column layout */}
                {useLinearLayout && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <RoadmapChapterCard chapter={chapter} index={i} side="left" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "4px" }}>
                      {chapter.topics?.map((topic, j) => (
                        <RoadmapTopicItem key={j} topic={topic} index={j} chapterIndex={i} side="right" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* end node */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              paddingTop: "24px",
              paddingBottom: "48px",
              animation: "edit-fadeIn 0.8s ease 0.5s forwards",
              opacity: 0,
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                boxShadow:
                  "0 0 0 5px rgba(10,15,30,1), 0 0 30px rgba(16,185,129,0.35)",
                zIndex: 3,
              }}
            >
              🎁
            </div>
            <p style={{ color: "#6b7280", fontSize: "13px", textAlign: "center", maxWidth: "260px", lineHeight: "1.5" }}>
              Ready to generate course content. Choose your method above!
            </p>
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              style={{
                padding: "14px 40px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                color: "white",
                fontSize: "15px",
                fontWeight: "700",
                cursor: isGenerating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 6px 24px rgba(16,185,129,0.3)",
                opacity: isGenerating ? 0.6 : 1,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 10px 32px rgba(16,185,129,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(16,185,129,0.35)";
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
