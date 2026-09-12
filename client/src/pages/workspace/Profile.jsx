import React, { useState } from "react";
import { useSelector } from "react-redux";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "40px", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ color: "white", fontSize: "24px", fontWeight: "700" }}>Profile Settings</h2>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "4px" }}>
          Update your personal information.
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "32px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", color: "white", fontWeight: "700",
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)"
          }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <button style={{
              padding: "8px 16px", borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white", fontSize: "13px", cursor: "pointer",
              transition: "background 0.2s"
            }}>Change Avatar</button>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", marginBottom: "8px" }}>Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: "14px", outline: "none"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", marginBottom: "8px" }}>Account Tier</label>
            <div style={{
              width: "100%", padding: "12px 16px", borderRadius: "10px",
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              color: user?.maxCredits > 20 ? "#4ade80" : "#a78bfa", fontSize: "14px", fontWeight: "600",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <span>{user?.maxCredits > 20 ? "Pro Plan" : "Free Tier"}</span>
              {user?.maxCredits <= 20 && (
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#6b7280" }}>
                  Upgrade for more credits
                </span>
              )}
            </div>
          </div>
          <div>
            <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", marginBottom: "8px" }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                color: "#9ca3af", fontSize: "14px", outline: "none", cursor: "not-allowed"
              }}
            />
            <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "6px" }}>Email cannot be changed.</p>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            style={{
              padding: "12px", borderRadius: "10px", marginTop: "10px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", color: "white", fontSize: "14px", fontWeight: "600",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              boxShadow: "0 4px 15px rgba(124,58,237,0.3)"
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

