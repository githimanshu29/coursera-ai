import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice.js";
import axiosInstance from "../../lib/axios.js";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const res = await axiosInstance.post("/auth/login", formData);
      dispatch(setCredentials({
        user: res.data.user,
        accessToken: res.data.accessToken,
      }));
      navigate("/workspace");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
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

      {/* bg blob top left */}
      <div style={{
        position: "absolute",
        top: "-100px",
        left: "-100px",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* bg blob bottom right */}
      <div style={{
        position: "absolute",
        bottom: "-100px",
        right: "-100px",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
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
        padding: "40px",
        boxShadow: "0 25px 50px rgba(88,28,235,0.15)",
      }}>

        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{
            width: "38px",
            height: "38px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: "700", fontSize: "20px", letterSpacing: "-0.3px" }}>
            Coursera<span style={{ color: "#a78bfa" }}>-AI</span>
          </span>
        </div>

        {/* heading */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: "white", fontSize: "28px", fontWeight: "700", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Sign in to continue your learning journey
          </p>
        </div>

        {/* error */}
        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
            fontSize: "13px",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* email field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#9ca3af", fontSize: "13px", fontWeight: "500" }}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="himanshu@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(31,41,55,0.8)",
                border: "1px solid rgba(75,85,99,0.5)",
                color: "white",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
            />
          </div>

          {/* password field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#9ca3af", fontSize: "13px", fontWeight: "500" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(31,41,55,0.8)",
                border: "1px solid rgba(75,85,99,0.5)",
                color: "white",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.7)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(75,85,99,0.5)"}
            />
          </div>

          {/* submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "12px",
              background: isLoading
                ? "rgba(124,58,237,0.5)"
                : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none",
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "4px",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.target.style.background = "linear-gradient(135deg, #6d28d9, #5b21b6)";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.target.style.background = "linear-gradient(135deg, #7c3aed, #6d28d9)";
            }}
          >
            {isLoading ? (
              <span style={{
                width: "18px",
                height: "18px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }} />
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        {/* divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "24px 0",
        }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <span style={{ color: "#4b5563", fontSize: "12px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* register link */}
        <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#a78bfa", fontWeight: "500", textDecoration: "none" }}>
            Create one free →
          </Link>
        </p>
      </div>

      {/* spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;