import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMeApi } from "../../lib/api.js";
import { updateCredits } from "../../store/slices/authSlice.js";

const GEMINI_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const Billing = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [customKey, setCustomKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    localStorage.getItem("customGeminiModel") || "gemini-2.5-flash-lite"
  );
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    // Load saved custom key
    const savedKey = localStorage.getItem("customGeminiKey");
    if (savedKey) {
      setCustomKey(savedKey);
      setIsSaved(true);
    }

    // Fetch latest user credits from backend
    const fetchUserStats = async () => {
      try {
        const res = await getMeApi();
        if (res.data.success) {
          dispatch(
            updateCredits({
              creditsUsed: res.data.user.creditsUsed,
              maxCredits: res.data.user.maxCredits,
            })
          );
        }
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      }
    };
    fetchUserStats();
  }, [dispatch]);

  const handleSaveKey = () => {
    if (customKey.trim()) {
      localStorage.setItem("customGeminiKey", customKey.trim());
      localStorage.setItem("customGeminiModel", selectedModel);
      setIsSaved(true);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2500);
    } else {
      localStorage.removeItem("customGeminiKey");
      localStorage.removeItem("customGeminiModel");
      setIsSaved(false);
      setSaveMsg("Removed!");
      setTimeout(() => setSaveMsg(""), 2500);
    }
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    localStorage.setItem("customGeminiModel", model);
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        paddingBottom: "40px",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ color: "white", fontSize: "24px", fontWeight: "700" }}>
          Billing & Credits
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "4px" }}>
          Manage your subscription and API usage.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Current Plan Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>
            Current Plan: Free
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: "8px 0 20px" }}>
            You are currently on the Free tier. Upgrade for more credits and
            premium AI models.
          </p>

          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#d1d5db", fontSize: "13px" }}>
                API Credits Used
              </span>
              <span style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>
                {Math.round(
                  ((user?.creditsUsed || 0) / (user?.maxCredits || 20)) * 100
                )}
                % ({user?.creditsUsed || 0}/{user?.maxCredits || 20})
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.round(
                    ((user?.creditsUsed || 0) / (user?.maxCredits || 20)) * 100
                  )}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                  transition: "width 0.5s ease-out",
                }}
              />
            </div>
          </div>

          <button
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
              marginBottom: "24px",
            }}
          >
            Upgrade to Pro
          </button>

          {/* BYOK Section */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <h4 style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>
                Bring Your Own Key (BYOK)
              </h4>
              {isSaved && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#4ade80",
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    padding: "2px 8px",
                    borderRadius: "20px",
                  }}
                >
                  ✓ Active
                </span>
              )}
            </div>
            <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "12px" }}>
              Use your own Gemini API key for course generation. Stored locally
              on your device only.{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#a78bfa",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Get a free key →
              </a>
            </p>

            {/* API Key input */}
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <input
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={customKey}
                onChange={(e) => {
                  setCustomKey(e.target.value);
                  setIsSaved(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 42px 10px 12px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.2)",
                  border: isSaved
                    ? "1px solid rgba(74,222,128,0.3)"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? "Hide key" : "Show key"}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  fontSize: "15px",
                  lineHeight: 1,
                  color: "#6b7280",
                }}
              >
                {showKey ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Model switcher */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: "#9ca3af",
                  fontSize: "11px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Gemini Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "auto",
                }}
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m} value={m} style={{ background: "#111827", color: "white" }}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Save row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleSaveKey}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  background: isSaved
                    ? "rgba(74,222,128,0.1)"
                    : "rgba(255,255,255,0.05)",
                  border: isSaved
                    ? "1px solid rgba(74,222,128,0.3)"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: isSaved ? "#4ade80" : "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {saveMsg || (isSaved ? "✓ Saved" : "Save")}
              </button>
              {customKey && isSaved && (
                <button
                  onClick={() => {
                    setCustomKey("");
                    setIsSaved(false);
                    localStorage.removeItem("customGeminiKey");
                    localStorage.removeItem("customGeminiModel");
                    setSaveMsg("Removed!");
                    setTimeout(() => setSaveMsg(""), 2500);
                  }}
                  style={{
                    padding: "9px 14px",
                    borderRadius: "8px",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#f87171",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pro Plan Advertisement */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(109,40,217,0.05))",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "16px",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(124,58,237,0.2)",
              color: "#a78bfa",
              padding: "4px 8px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            RECOMMENDED
          </div>

          <h3 style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>
            Pro Plan
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              marginTop: "12px",
            }}
          >
            <span style={{ color: "white", fontSize: "32px", fontWeight: "700" }}>
              $15
            </span>
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>/month</span>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "20px 0",
              color: "#d1d5db",
              fontSize: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981" }}>✓</span> Unlimited course
              generations
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981" }}>✓</span> Access to premium AI
              models
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981" }}>✓</span> Export to PDF &
              Markdown
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Billing;
