import { useNavigate } from "react-router-dom";

const EnrolledCourseCard = ({ item, onDelete }) => {
  const navigate = useNavigate();
  const { course, enrollment } = item;

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
          background: "rgba(34,197,94,0.1)",
          color: "#4ade80",
          border: "1px solid rgba(34,197,94,0.2)",
        }}>
          ENROLLED
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
        {course?.name}
      </h3>

      {/* description */}
      <p style={{
        color: "#6b7280", fontSize: "12px", lineHeight: "1.5",
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {course?.description}
      </p>

      {/* progress bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>Progress</span>
          <span style={{ color: "#a78bfa", fontSize: "12px", fontWeight: "600" }}>
            {enrollment?.progress || 0}%
          </span>
        </div>
        <div style={{
          width: "100%", height: "4px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "2px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${enrollment?.progress || 0}%`,
            background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
            borderRadius: "2px",
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* continue learning button */}
      <button
        onClick={() => navigate(`/workspace/view-course/${course?.cid}`)}
        style={{
          width: "100%", padding: "10px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          border: "none", color: "white",
          fontSize: "13px", fontWeight: "600",
          cursor: "pointer", transition: "opacity 0.2s",
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "8px",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Continue Learning
      </button>

      {/* delete */}
      <button
        onClick={() => onDelete(enrollment?._id)}
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

export default EnrolledCourseCard;