import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice.js";
import axiosInstance from "../../lib/axios.js";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "male",
    avatar: "https://avatar.iran.liara.run/public/boy?username=1",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/auth/register", formData);
      dispatch(setCredentials({
        user: res.data.user,
        accessToken: res.data.accessToken,
      }));
      navigate("/workspace");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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

  return (
    <div style={{
      height: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0a0f1e",
      position: "relative",
      overflow: "hidden",
      padding: "16px",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* bg blobs */}
      <div style={{
        position: "absolute", top: "-100px", left: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-100px", right: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      {/* card */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "420px",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "28px 32px",
        boxShadow: "0 25px 50px rgba(88,28,235,0.15)",
      }}>

        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{
            width: "34px", height: "34px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: "700", fontSize: "18px", letterSpacing: "-0.3px" }}>
            Coursera<span style={{ color: "#a78bfa" }}>-AI</span>
          </span>
        </div>

        {/* heading + avatar row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h1 style={{ color: "white", fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
              Create account
            </h1>
            <p style={{ color: "#6b7280", fontSize: "13px" }}>
              Start your AI learning journey
            </p>
          </div>
          {/* placeholder avatar */}
          <div style={{
            width: "52px", height: "52px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
            boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
            flexShrink: 0,
          }}>
            👤
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
            marginBottom: "14px",
          }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Full name</label>
            <input
              type="text" name="name"
              placeholder="Himanshu Kumar"
              value={formData.name}
              onChange={handleChange} required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
            />
          </div>

          {/* email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email" name="email"
              placeholder="himanshu@gmail.com"
              value={formData.email}
              onChange={handleChange} required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
            />
          </div>

          {/* password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password" name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange} required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
            />
          </div>

          {/* gender */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={labelStyle}>Gender</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {["male", "female"].map((g) => (
                <div
                  key={g}
                  onClick={() => setFormData({ ...formData, gender: g })}
                  style={{
                    flex: 1, padding: "9px",
                    borderRadius: "10px",
                    border: formData.gender === g
                      ? "1px solid rgba(124,58,237,0.7)"
                      : "1px solid rgba(75,85,99,0.5)",
                    background: formData.gender === g
                      ? "rgba(124,58,237,0.15)"
                      : "rgba(31,41,55,0.5)",
                    color: formData.gender === g ? "#a78bfa" : "#6b7280",
                    fontSize: "13px", fontWeight: "500",
                    textAlign: "center", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {g === "male" ? "👨 Male" : "👩 Female"}
                </div>
              ))}
            </div>
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%", padding: "12px",
              borderRadius: "12px",
              background: isLoading
                ? "rgba(124,58,237,0.5)"
                : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", color: "white",
              fontSize: "14px", fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              transition: "all 0.2s",
              marginTop: "2px",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = "linear-gradient(135deg, #6d28d9, #5b21b6)";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = "linear-gradient(135deg, #7c3aed, #6d28d9)";
            }}
          >
            {isLoading ? (
              <span style={{
                width: "17px", height: "17px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }} />
            ) : "Create Account →"}
          </button>
        </form>

        {/* divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <span style={{ color: "#4b5563", fontSize: "11px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
        </div>

        <p style={{ color: "#6b7280", fontSize: "13px", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#a78bfa", fontWeight: "500", textDecoration: "none" }}>
            Sign in →
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Register;