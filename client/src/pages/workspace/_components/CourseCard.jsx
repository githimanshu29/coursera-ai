// eslint-disable-next-line no-unused-vars
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course, onDelete, onEnroll, onGenerateContent }) => {
  const isReady = course.status === "READY";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
    >

      {/* top row — badge + icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          padding: "4px 10px", borderRadius: "20px",
          fontSize: "11px", fontWeight: "600",
          background: isReady ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)",
          color: isReady ? "#4ade80" : "#facc15",
          border: `1px solid ${isReady ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)"}`,
        }}>
          {isReady ? "READY" : "SETUP REQUIRED"}
        </span>

        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "16px",
        }}>
          🤖
        </div>
      </div>

      {/* title */}
      <h3 style={{
        color: "white", fontSize: "15px",
        fontWeight: "600", lineHeight: "1.4",
      }}>
        {course.name}
      </h3>

      {/* description */}
      <p style={{
        color: "#6b7280", fontSize: "12px", lineHeight: "1.5",
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {course.description}
      </p>

      {/* chapters count */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280" }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span style={{ fontSize: "12px" }}>{course.noOfChapters} Chapters</span>
      </div>

      {/* primary action button */}
      {isReady ? (
        <button
          onClick={() => onEnroll(course.cid)}
          style={{
            width: "100%", padding: "10px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            border: "none", color: "white",
            fontSize: "13px", fontWeight: "600",
            cursor: "pointer", transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          ⊕ Enroll
        </button>
      ) : (
        <button
          onClick={() => onGenerateContent(course.cid)}
          style={{
            width: "100%", padding: "10px",
            borderRadius: "10px",
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#a78bfa",
            fontSize: "13px", fontWeight: "600",
            cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(124,58,237,0.25)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(124,58,237,0.15)"}
        >
          ⚙ Generate Content
        </button>
      )}

      {/* delete */}
      <button
        onClick={() => onDelete(course.cid)}
        style={{
          width: "100%", padding: "8px",
          background: "transparent", border: "none",
          color: "#6b7280", fontSize: "12px",
          cursor: "pointer",
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "6px",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Course
      </button>
    </div>
  );
};

export default CourseCard;