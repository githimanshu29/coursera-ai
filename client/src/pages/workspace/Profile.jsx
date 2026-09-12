import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice.js";
import { updateProfileApi } from "../../lib/api.js";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const fileInputRef = useRef(null);

  const isPro = user?.maxCredits > 20;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 750000) {
      setSaveErr("Image too large. Please pick an image under 750KB.");
      return;
    }
    setSaveErr("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setAvatarBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  };


  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg("");
    setSaveErr("");
    try {
      const payload = { name };
      if (avatarBase64) payload.avatar = avatarBase64;

      const res = await updateProfileApi(payload);
      if (res.data.success) {
        dispatch(
          setCredentials({
            user: { ...user, ...res.data.user },
            accessToken,
          })
        );
        setAvatarBase64(null);
        setSaveMsg("Profile saved successfully!");
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch (err) {
      setSaveErr(err?.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";
  const showAvatar = avatarPreview && avatarPreview.startsWith("data:");

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        maxWidth: "620px",
        margin: "0 auto",
        padding: "20px",
        paddingBottom: "60px",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ color: "white", fontSize: "24px", fontWeight: "700" }}>
          Profile Settings
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "4px" }}>
          Manage your account information.
        </p>
      </div>

      {/* Main profile card */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "32px",
        }}
      >
        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <div style={{ position: "relative" }}>
            {showAvatar ? (
              <img
                src={avatarPreview}
                alt="avatar"
                style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                  border: avatarBase64 ? "2px solid #7c3aed" : "none",
                }}
              />
            ) : (
              <div
                style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px", color: "white", fontWeight: "700",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                }}
              >
                {avatarLetter}
              </div>
            )}
            {avatarBase64 && (
              <div
                style={{
                  position: "absolute", bottom: "2px", right: "2px",
                  width: "14px", height: "14px", borderRadius: "50%",
                  background: "#7c3aed", border: "2px solid #0a0f1e",
                }}
                title="Unsaved avatar — click Save Changes"
              />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "8px 16px", borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: "13px", cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              Change Avatar
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "6px" }}>JPG, PNG or GIF · max 750KB</p>
            {avatarBase64 && <p style={{ color: "#a78bfa", fontSize: "12px", marginTop: "4px" }}>⬆ Click Save Changes to apply</p>}
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Full Name */}
          <div>
            <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", marginBottom: "8px" }}>Full Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", marginBottom: "8px" }}>Email Address</label>
            <input
              type="email" value={user?.email || ""} disabled
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                color: "#9ca3af", fontSize: "14px", outline: "none", cursor: "not-allowed", boxSizing: "border-box",
              }}
            />
            <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "6px" }}>Email cannot be changed.</p>
          </div>

          {/* Account Tier */}
          <div>
            <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", marginBottom: "8px" }}>Account Tier</label>
            <div
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                background: "rgba(255,255,255,0.02)",
                border: isPro ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(167,139,250,0.25)",
                color: isPro ? "#4ade80" : "#a78bfa",
                fontSize: "14px", fontWeight: "600",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{isPro ? "⭐" : "🆓"}</span>
                {isPro ? "Pro Plan" : "Free Tier"}
              </span>
              {!isPro && (
                <button
                  type="button"
                  onClick={() => navigate("/workspace/billing")}
                  style={{
                    fontSize: "11px", fontWeight: "600", color: "#7c3aed",
                    background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: "6px", padding: "3px 10px", cursor: "pointer",
                  }}
                >
                  Upgrade →
                </button>
              )}
            </div>
          </div>

          {/* Error / Success */}
          {saveErr && <p style={{ color: "#f87171", fontSize: "13px" }}>✗ {saveErr}</p>}

          {/* Save button */}
          <button
            type="submit" disabled={isSaving}
            style={{
              padding: "12px", borderRadius: "10px", marginTop: "4px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", color: "white", fontSize: "14px", fontWeight: "600",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          {saveMsg && <p style={{ color: "#4ade80", fontSize: "13px", textAlign: "center" }}>✓ {saveMsg}</p>}
        </form>
      </div>

    </div>
  );
};

export default Profile;
