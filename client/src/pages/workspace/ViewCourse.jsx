import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
// import { getEnrolledCourseByIdApi } from "../../lib/api.js";
import { getCourseByIdApi } from "../../lib/api.js";
/* ── tiny hook: fade-in on scroll ──────────────────────────────────────── */
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

/* ── Chapter Card sub-component ────────────────────────────────────────── */
const ChapterCard = ({ chapter, index, side }) => {
  const [hovered, setHovered] = useState(false);
  const [ref, visible] = useInView(0.1);

  const colors = [
    {
      bg: "rgba(124,58,237,0.14)",
      border: "rgba(124,58,237,0.32)",
      accent: "#a78bfa",
      glow: "rgba(124,58,237,0.25)",
    },
    {
      bg: "rgba(96,165,250,0.12)",
      border: "rgba(96,165,250,0.30)",
      accent: "#93c5fd",
      glow: "rgba(96,165,250,0.20)",
    },
    {
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.28)",
      accent: "#6ee7b7",
      glow: "rgba(52,211,153,0.20)",
    },
    {
      bg: "rgba(251,146,60,0.12)",
      border: "rgba(251,146,60,0.28)",
      accent: "#fdba74",
      glow: "rgba(251,146,60,0.20)",
    },
    {
      bg: "rgba(244,114,182,0.12)",
      border: "rgba(244,114,182,0.28)",
      accent: "#f9a8d4",
      glow: "rgba(244,114,182,0.20)",
    },
  ];
  const c = colors[index % colors.length];

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="roadmap-chapter-card"
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${c.bg}, rgba(15,18,32,0.95))`
          : `linear-gradient(145deg, ${c.bg}, rgba(10,15,30,0.85))`,
        border: `1px solid ${hovered ? c.accent + "55" : c.border}`,
        borderRadius: "18px",
        padding: "22px 24px",
        transition: "all 0.4s cubic-bezier(.25,.8,.25,1)",
        transform: visible
          ? hovered
            ? "translateY(-4px) scale(1.01)"
            : "translateY(0)"
          : `translateX(${side === "left" ? "-40px" : "40px"})`,
        opacity: visible ? 1 : 0,
        boxShadow: hovered
          ? `0 16px 40px ${c.glow}, 0 0 0 1px ${c.accent}22`
          : "0 4px 20px rgba(0,0,0,0.15)",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* shimmer on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(120deg, transparent, ${c.accent}08, transparent)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "4px 12px",
            borderRadius: "20px",
            background: `${c.accent}20`,
            border: `1px solid ${c.accent}35`,
            color: c.accent,
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Chapter {index + 1}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "#6b7280",
            fontSize: "11px",
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {chapter.duration}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          color: "white",
          fontSize: "16px",
          fontWeight: "700",
          marginBottom: "10px",
          lineHeight: "1.4",
          letterSpacing: "-0.2px",
        }}
      >
        {chapter.chapterName}
      </h3>

      {/* Topics count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: c.accent,
          fontSize: "12px",
          fontWeight: "600",
        }}
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        {chapter.topics?.length} Topics
      </div>
    </div>
  );
};

/* ── Topic Pill sub-component ──────────────────────────────────────────── */
const TopicItem = ({ topic, index: topicIdx, chapterIndex, side }) => {
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
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        background: hovered
          ? "rgba(255,255,255,0.04)"
          : "rgba(255,255,255,0.015)",
        border: `1px solid ${hovered ? accent + "30" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "12px",
        transition: "all 0.3s ease",
        transform: visible
          ? hovered
            ? "translateX(4px)"
            : "translateX(0)"
          : `translateX(${side === "right" ? "30px" : "-30px"})`,
        opacity: visible ? 1 : 0,
        transitionDelay: `${topicIdx * 60}ms`,
        cursor: "default",
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: `2px solid ${hovered ? accent : accent + "55"}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          background: hovered ? accent + "15" : "transparent",
        }}
      >
        {hovered && (
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: accent,
            }}
          />
        )}
      </div>
      <span
        style={{
          color: hovered ? "#e5e7eb" : "#9ca3af",
          fontSize: "13px",
          lineHeight: "1.4",
          transition: "color 0.3s ease",
        }}
      >
        {topic}
      </span>
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────────────────── */
const ViewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
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

  const { data, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await getCourseByIdApi(courseId);
      return res.data;
    },
  });

  const course = data?.course;
  // eslint-disable-next-line no-unused-vars
  const enrollment = data?.enrollment;
  const useLinearLayout = isMobile || isTablet;

  /* ── Loading state ── */
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
            width: "44px",
            height: "44px",
            border: "3px solid rgba(124,58,237,0.2)",
            borderTop: "3px solid #7c3aed",
            borderRadius: "50%",
            animation: "roadmap-spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            color: "#6b7280",
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Loading your roadmap...
        </p>
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: isMobile ? "20px 8px" : "20px",
      }}
    >
      {/* ── Scoped styles (CSS animations + responsive) ── */}
      <style>{`
        @keyframes roadmap-spin { to { transform: rotate(360deg); } }
        @keyframes roadmap-fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes roadmap-pulseGlow {
          0%, 100% { box-shadow: 0 0 0 4px rgba(10,15,30,1), 0 0 0 7px rgba(124,58,237,0.2); }
          50%       { box-shadow: 0 0 0 4px rgba(10,15,30,1), 0 0 0 7px rgba(124,58,237,0.45); }
        }
        @keyframes roadmap-lineGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

        .roadmap-chapter-card:active { transform: scale(0.98) !important; }

        /* Responsive overrides */
        @media (max-width: 640px) {
          .roadmap-header-title { font-size: 22px !important; }
          .roadmap-header-sub   { font-size: 13px !important; }
          .roadmap-row          { grid-template-columns: 1fr !important; padding-left: 52px !important; }
          .roadmap-topics-col   { padding: 0 !important; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .roadmap-header-title { font-size: 25px !important; }
          .roadmap-row          { grid-template-columns: 1fr !important; padding-left: 56px !important; }
          .roadmap-topics-col   { padding: 0 !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          marginBottom: "48px",
          textAlign: "center",
          animation: "roadmap-fadeIn 0.6s ease forwards",
        }}
      >
        {/* decorative badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "30px",
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.22)",
            marginBottom: "16px",
            fontSize: "12px",
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span
            style={{
              color: "#a78bfa",
              fontWeight: "600",
              letterSpacing: "0.3px",
            }}
          >
            Learning Roadmap
          </span>
        </div>

        <h1
          className="roadmap-header-title"
          style={{
            color: "white",
            fontSize: "30px",
            fontWeight: "800",
            marginBottom: "8px",
            letterSpacing: "-0.5px",
            lineHeight: "1.2",
          }}
        >
          {course?.courseJson?.courseName || "Course Roadmap"}
        </h1>
        <p
          className="roadmap-header-sub"
          style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}
        >
          {course?.courseJson?.chapters?.length} chapters · Your structured
          learning path
        </p>
      </div>

      {/* ── Timeline ── */}
      <div style={{ position: "relative" }}>
        {/* ── Center / Left vertical line ── */}
        <div
          style={{
            position: "absolute",
            left: useLinearLayout ? "24px" : "50%",
            top: 0,
            bottom: 0,
            width: "3px",
            borderRadius: "3px",
            background:
              "linear-gradient(180deg, #7c3aed 0%, #a78bfa 40%, #ec4899 75%, #6366f1 100%)",
            transform: useLinearLayout ? "none" : "translateX(-50%)",
            transformOrigin: "top",
            animation: "roadmap-lineGrow 1.2s ease forwards",
            opacity: 0.65,
          }}
        />

        {/* ── Chapter rows ── */}
        {course?.courseJson?.chapters?.map((chapter, i) => {
          const isLeft = i % 2 === 0;

          return (
            <div
              key={i}
              className="roadmap-row"
              style={{
                display: "grid",
                gridTemplateColumns: useLinearLayout ? "1fr" : "1fr 1fr",
                gap: useLinearLayout
                  ? "12px"
                  : "80px" /* 80 = room for the center node */,
                marginBottom: isMobile ? "36px" : "48px",
                position: "relative",
                paddingLeft: useLinearLayout ? "56px" : "0",
              }}
            >
              {/* ── Timeline node (chapter number) ── */}
              <div
                style={{
                  position: "absolute",
                  left: useLinearLayout ? "24px" : "50%",
                  top: "18px",
                  transform: "translate(-50%, 0)",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "800",
                  zIndex: 3,
                  animation: "roadmap-pulseGlow 3s ease-in-out infinite",
                  animationDelay: `${i * 0.3}s`,
                  letterSpacing: "-0.3px",
                }}
              >
                {i + 1}
              </div>

              {/* ── Desktop two-column layout ── */}
              {!useLinearLayout && (
                <>
                  {/* LEFT COLUMN */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      alignItems:
                        "flex-end" /* right-align content to hug center */,
                      paddingRight: "20px",
                    }}
                  >
                    {isLeft ? (
                      /* Chapter card on left */
                      <div style={{ width: "100%", maxWidth: "380px" }}>
                        <ChapterCard chapter={chapter} index={i} side="left" />
                      </div>
                    ) : (
                      /* Topics on left */
                      <div
                        className="roadmap-topics-col"
                        style={{
                          width: "100%",
                          maxWidth: "380px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          paddingTop: "6px",
                        }}
                      >
                        {chapter.topics?.map((topic, j) => (
                          <TopicItem
                            key={j}
                            topic={topic}
                            index={j}
                            chapterIndex={i}
                            side="left"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      alignItems:
                        "flex-start" /* left-align content to hug center */,
                      paddingLeft: "20px",
                    }}
                  >
                    {isLeft ? (
                      /* Topics on right */
                      <div
                        className="roadmap-topics-col"
                        style={{
                          width: "100%",
                          maxWidth: "380px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          paddingTop: "6px",
                        }}
                      >
                        {chapter.topics?.map((topic, j) => (
                          <TopicItem
                            key={j}
                            topic={topic}
                            index={j}
                            chapterIndex={i}
                            side="right"
                          />
                        ))}
                      </div>
                    ) : (
                      /* Chapter card on right */
                      <div style={{ width: "100%", maxWidth: "380px" }}>
                        <ChapterCard chapter={chapter} index={i} side="right" />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Mobile / Tablet single-column layout ── */}
              {useLinearLayout && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <ChapterCard chapter={chapter} index={i} side="left" />

                  {/* Topics inline */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      paddingLeft: "4px",
                    }}
                  >
                    {chapter.topics?.map((topic, j) => (
                      <TopicItem
                        key={j}
                        topic={topic}
                        index={j}
                        chapterIndex={i}
                        side="right"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── End node + Start Learning ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            paddingTop: "24px",
            paddingBottom: "48px",
            animation: "roadmap-fadeIn 0.8s ease 0.5s forwards",
            opacity: 0,
          }}
        >
          {/* 🎉 Node */}
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
            🎉
          </div>

          <p
            style={{
              color: "#6b7280",
              fontSize: "13px",
              textAlign: "center",
              maxWidth: "260px",
              lineHeight: "1.5",
            }}
          >
            You've previewed the full course. Start learning to track your
            progress!
          </p>

          <button
            onClick={() => navigate(`/course/${courseId}`)}
            style={{
              padding: "14px 44px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              color: "white",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 6px 24px rgba(16,185,129,0.35)",
              transition: "all 0.3s ease",
              letterSpacing: "-0.2px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 10px 32px rgba(16,185,129,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 6px 24px rgba(16,185,129,0.35)";
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
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
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCourse;
