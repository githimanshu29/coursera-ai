import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice.js";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const fileInputRef = useRef(null);

  const isPro = user?.maxCredits > 20;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Optimistically update the name in Redux so sidebar/header reflect it
    dispatch(setCredentials({ user: { ...user, name }, accessToken }));
    setTimeout(() => {
      setIsSaving(false);
      setSaveMsg("Profile updated!");
      setTimeout(() => setSaveMsg(""), 3000);
    }, 800);
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

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

      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "32px",
        }}
      >
        {/* Avatar row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {/* Avatar circle */}
          <div style={{ position: "relative" }}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  color: "white",
                  fontWeight: "700",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                }}
              >
                {avatarLetter}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "13px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
              }
            >
              Change Avatar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
            <p
              style={{
                color: "#6b7280",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              JPG, PNG or GIF
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Full Name */}
          <div>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Email Address */}
          <div>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#9ca3af",
                fontSize: "14px",
                outline: "none",
                cursor: "not-allowed",
                boxSizing: "border-box",
              }}
            />
            <p
              style={{
                color: "#6b7280",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              Email cannot be changed.
            </p>
          </div>

          {/* Account Tier */}
          <div>
            <label
              style={{
                display: "block",
                color: "#d1d5db",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Account Tier
            </label>
            <div
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.02)",
                border: isPro
                  ? "1px solid rgba(74,222,128,0.25)"
                  : "1px solid rgba(167,139,250,0.25)",
                color: isPro ? "#4ade80" : "#a78bfa",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{isPro ? "⭐" : "🆓"}</span>
                {isPro ? "Pro Plan" : "Free Tier"}
              </span>
              {!isPro && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#6b7280",
                  }}
                >
                  {user?.creditsUsed ?? 0} / {user?.maxCredits ?? 20} credits used
                </span>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: "12px",
              borderRadius: "10px",
              marginTop: "10px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
              transition: "opacity 0.2s",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          {saveMsg && (
            <p
              style={{
                color: "#4ade80",
                fontSize: "13px",
                textAlign: "center",
                marginTop: "-8px",
              }}
            >
              ✓ {saveMsg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
