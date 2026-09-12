import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMeApi } from "../../lib/api.js";
import { updateCredits } from "../../store/slices/authSlice.js";

const Billing = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [customKey, setCustomKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // ── Load saved custom key ──
    const savedKey = localStorage.getItem("customGeminiKey");
    if (savedKey) {
      setCustomKey(savedKey);
      setIsSaved(true);
    }

    // ── Fetch latest user credits from backend ──
    const fetchUserStats = async () => {
      try {
        const res = await getMeApi();
        if (res.data.success) {
          dispatch(updateCredits({
            creditsUsed: res.data.user.creditsUsed,
            maxCredits: res.data.user.maxCredits,
          }));
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
      setIsSaved(true);
      alert("Custom Gemini API Key saved locally!");
    } else {
      localStorage.removeItem("customGeminiKey");
      setIsSaved(false);
      alert("Custom Gemini API Key removed!");
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "40px", maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ color: "white", fontSize: "24px", fontWeight: "700" }}>Billing & Credits</h2>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "4px" }}>
          Manage your subscription and API usage.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* Current Plan Card */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Current Plan: Free</h3>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: "8px 0 20px" }}>You are currently on the Free tier. Upgrade for more credits and premium AI models.</p>
          
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#d1d5db", fontSize: "13px" }}>API Credits Used</span>
              <span style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>
                {Math.round(((user?.creditsUsed || 0) / (user?.maxCredits || 20)) * 100)}% ({user?.creditsUsed || 0}/{user?.maxCredits || 20})
              </span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ 
                width: `${Math.round(((user?.creditsUsed || 0) / (user?.maxCredits || 20)) * 100)}%`, 
                height: "100%", 
                background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                transition: "width 0.5s ease-out" 
              }}></div>
            </div>
          </div>

          <button style={{
            width: "100%", padding: "10px", borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            border: "none", color: "white", fontWeight: "600", cursor: "pointer",
            boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
            marginBottom: "24px"
          }}>Upgrade to Pro</button>

          {/* BYOK Section */}
          <div style={{
            marginTop: "auto",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)"
          }}>
            <h4 style={{ color: "white", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Bring Your Own Key (BYOK)</h4>
            <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "12px" }}>Bypass server limits by providing your own Google Gemini API key. This is stored locally on your device.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={customKey}
                onChange={(e) => {
                  setCustomKey(e.target.value);
                  setIsSaved(false);
                }}
                style={{
                  flex: 1, padding: "10px", borderRadius: "8px",
                  background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontSize: "13px", outline: "none"
                }}
              />
              <button
                onClick={handleSaveKey}
                style={{
                  padding: "0 16px", borderRadius: "8px",
                  background: isSaved ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                  border: isSaved ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  color: isSaved ? "#10b981" : "white",
                  fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Pro Plan Advertisement */}
        <div style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(109,40,217,0.05))",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: "16px",
          padding: "24px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: "16px", right: "16px",
            background: "rgba(124,58,237,0.2)", color: "#a78bfa",
            padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700"
          }}>RECOMMENDED</div>
          
          <h3 style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Pro Plan</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "12px" }}>
            <span style={{ color: "white", fontSize: "32px", fontWeight: "700" }}>$15</span>
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>/month</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", color: "#d1d5db", fontSize: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981" }}>✓</span> Unlimited course generations
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981" }}>✓</span> Access to Gemini 1.5 Pro
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10b981" }}>✓</span> Export to PDF & Markdown
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Billing;
