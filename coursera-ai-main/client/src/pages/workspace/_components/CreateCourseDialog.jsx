import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCourseLayoutApi } from "../../../lib/api.js";
import { v4 as uuidv4 } from "uuid";

const LEVELS = ["beginner", "moderate", "advanced"];
const CATEGORIES = ["Technology", "Science", "Mathematics", "Language", "Business", "Arts", "Health", "Sports", "Other"];

const CreateCourseDialog = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    level: "beginner",
    noOfChapters: "",
    includeVideo: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const cid = uuidv4();
      await generateCourseLayoutApi({ cid, ...formData, noOfChapters: Number(formData.noOfChapters) });
      onClose();
      navigate(`/workspace/edit-course/${cid}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate course");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "rgba(31,41,55,0.8)",
    border: "1px solid rgba(75,85,99,0.5)",
    color: "white",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    color: "#9ca3af",
    fontSize: "12px",
    fontWeight: "500",
  };

  if (!isOpen) return null;

  return (
    // overlay
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* dialog card — stop click propagation */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "32px",
          position: "relative",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          fontFamily: "'Inter', sans-serif",
        }}
      >

        {/* close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "rgba(255,255,255,0.05)",
            border: "none", color: "#6b7280",
            width: "32px", height: "32px",
            borderRadius: "8px", cursor: "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          ✕
        </button>

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{
            width: "40px", height: "40px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            borderRadius: "12px",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
            fontSize: "20px",
          }}>
            ✦
          </div>
          <div>
            <h2 style={{ color: "white", fontSize: "18px", fontWeight: "700" }}>
              Create a New Course with AI
            </h2>
            <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>
              Fill in the details and let AI craft your course
            </p>
          </div>
        </div>

        {/* error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171", fontSize: "12px",
            padding: "10px 14px", borderRadius: "10px",
            marginBottom: "16px",
          }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* course name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Course Name</label>
            <input
              type="text" name="name"
              placeholder="e.g. Introduction to Quantum Computing"
              value={formData.name}
              onChange={handleChange} required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
            />
          </div>

          {/* description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Description <span style={{ color: "#4b5563" }}>(optional)</span></label>
            <textarea
              name="description"
              placeholder="A brief summary of what the course is about"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              style={{
                ...inputStyle,
                resize: "none",
                lineHeight: "1.5",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
            />
          </div>

          {/* chapters + level row */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={labelStyle}>No. of Chapters</label>
              <input
                type="number" name="noOfChapters"
                placeholder="e.g. 10"
                value={formData.noOfChapters}
                onChange={handleChange}
                min="1" max="20" required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={labelStyle}>Difficulty Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                  appearance: "none",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l} style={{ background: "#111827" }}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* category */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                ...inputStyle,
                cursor: "pointer",
                appearance: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
            >
              <option value="" style={{ background: "#111827" }}>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ background: "#111827" }}>{c}</option>
              ))}
            </select>
          </div>

          {/* include video toggle */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(31,41,55,0.8)",
            border: "1px solid rgba(75,85,99,0.5)",
            borderRadius: "10px", padding: "12px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ color: "#d1d5db", fontSize: "13px" }}>Include Video Content</span>
            </div>
            {/* toggle switch */}
            <div
              onClick={() => setFormData({ ...formData, includeVideo: !formData.includeVideo })}
              style={{
                width: "40px", height: "22px",
                borderRadius: "11px",
                background: formData.includeVideo ? "#7c3aed" : "rgba(75,85,99,0.5)",
                position: "relative", cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute",
                top: "3px",
                left: formData.includeVideo ? "21px" : "3px",
                width: "16px", height: "16px",
                borderRadius: "50%",
                background: "white",
                transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }} />
            </div>
          </div>

          {/* submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%", padding: "13px",
              borderRadius: "12px",
              background: isLoading
                ? "rgba(124,58,237,0.5)"
                : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", color: "white",
              fontSize: "14px", fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
              marginTop: "4px",
              boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  width: "17px", height: "17px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
                Generating Course...
              </>
            ) : (
              <>✦ Generate Course</>
            )}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CreateCourseDialog;