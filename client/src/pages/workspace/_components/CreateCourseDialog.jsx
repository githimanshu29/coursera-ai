import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { generateCourseLayoutApi } from "../../../lib/api.js";
import { v4 as uuidv4 } from "uuid";

const LEVELS = ["beginner", "moderate", "advanced"];
const CATEGORIES = [
  "Technology", "Science", "Mathematics", "Language",
  "Business", "Arts", "Health", "Sports", "Other",
];

const CreateCourseDialog = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isPro = user?.maxCredits > 20;

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
    setError("");

    // Free tier: check that a Gemini key was saved in profile
    if (!isPro) {
      const savedKey = localStorage.getItem("customGeminiKey");
      if (!savedKey || savedKey.trim().length < 10) {
        setError("no_key");
        return;
      }
    }

    setIsLoading(true);
    try {
      const cid = uuidv4();
      await generateCourseLayoutApi({
        cid,
        ...formData,
        noOfChapters: Number(formData.noOfChapters),
      });
      onClose();
      navigate(`/workspace/edit-course/${cid}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate course");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    background: "rgba(31,41,55,0.8)", border: "1px solid rgba(75,85,99,0.5)",
    color: "white", fontSize: "13px", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
  };

  const labelStyle = { color: "#9ca3af", fontSize: "12px", fontWeight: "500" };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: "20px", padding: "28px",
          width: "100%", maxWidth: "480px",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>Create New Course</h2>
            <span
              style={{
                padding: "3px 10px", borderRadius: "20px",
                fontSize: "11px", fontWeight: "700",
                background: isPro ? "rgba(74,222,128,0.1)" : "rgba(167,139,250,0.1)",
                color: isPro ? "#4ade80" : "#a78bfa",
                border: isPro ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(167,139,250,0.25)",
              }}
            >
              {isPro ? "⭐ Pro Plan" : "🆓 Free Tier"}
            </span>
          </div>
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "6px" }}>
            {isPro
              ? "Generate unlimited courses using the platform's AI."
              : "Uses your Gemini API key saved in your profile."}
          </p>
        </div>

        {/* No API key warning */}
        {error === "no_key" ? (
          <div
            style={{
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.3)",
              borderRadius: "12px", padding: "16px",
              marginBottom: "16px", textAlign: "center",
            }}
          >
            <p style={{ color: "#a78bfa", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
              🔑 No Gemini API Key Found
            </p>
            <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "14px" }}>
              Free tier requires a Gemini API key. Add it once in your Billing settings.
            </p>
            <button
              onClick={() => { onClose(); navigate("/workspace/billing"); }}
              style={{
                padding: "9px 20px", borderRadius: "8px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                border: "none", color: "white",
                fontSize: "13px", fontWeight: "600", cursor: "pointer",
              }}
            >
              Go to Billing ?
            </button>
          </div>
        ) : error ? (
          <div
            style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px", padding: "10px 14px", marginBottom: "16px",
              color: "#f87171", fontSize: "13px", display: "flex", alignItems: "flex-start", gap: "8px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginTop: "1px" }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Course name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Course Name</label>
            <input
              type="text" name="name"
              placeholder="e.g. Introduction to Quantum Computing"
              value={formData.name} onChange={handleChange} required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.7)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(75,85,99,0.5)")}
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Description <span style={{ color: "#4b5563" }}>(optional)</span></label>
            <textarea
              name="description"
              placeholder="A brief summary of what the course is about"
              value={formData.description} onChange={handleChange} rows={2}
              style={{ ...inputStyle, resize: "none", lineHeight: "1.5" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.7)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(75,85,99,0.5)")}
            />
          </div>

          {/* Chapters + level */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={labelStyle}>No. of Chapters</label>
              <input
                type="number" name="noOfChapters" placeholder="e.g. 10"
                value={formData.noOfChapters} onChange={handleChange}
                min="1" max="20" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.7)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(75,85,99,0.5)")}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={labelStyle}>Difficulty Level</label>
              <select
                name="level" value={formData.level} onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.7)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(75,85,99,0.5)")}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l} style={{ background: "#111827" }}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Category</label>
            <select
              name="category" value={formData.category} onChange={handleChange} required
              style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.7)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(75,85,99,0.5)")}
            >
              <option value="" style={{ background: "#111827" }}>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ background: "#111827" }}>{c}</option>
              ))}
            </select>
          </div>

          {/* Include video toggle */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(31,41,55,0.8)", border: "1px solid rgba(75,85,99,0.5)",
              borderRadius: "10px", padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ color: "#d1d5db", fontSize: "13px" }}>Include Video Content</span>
            </div>
            <div
              onClick={() => setFormData({ ...formData, includeVideo: !formData.includeVideo })}
              style={{
                width: "40px", height: "22px", borderRadius: "11px",
                background: formData.includeVideo ? "#7c3aed" : "rgba(75,85,99,0.5)",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute", top: "3px",
                  left: formData.includeVideo ? "21px" : "3px",
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "white", transition: "left 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={isLoading}
            style={{
              width: "100%", padding: "13px", borderRadius: "12px",
              background: isLoading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", color: "white", fontSize: "14px", fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginTop: "4px", boxShadow: "0 4px 20px rgba(124,58,237,0.3)", transition: "all 0.2s",
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    width: "17px", height: "17px",
                    border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white",
                    borderRadius: "50%", display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Generating Course...
              </>
            ) : (
              <>✨ Generate Course</>
            )}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CreateCourseDialog;
