import { useSelector } from "react-redux";

const WelcomeBanner = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(109,40,217,0.05))",
      border: "1px solid rgba(124,58,237,0.2)",
      borderRadius: "16px",
      padding: "28px 32px",
      marginBottom: "32px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* bg glow */}
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "200px", height: "200px",
        background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <h1 style={{ color: "white", fontSize: "26px", fontWeight: "700", marginBottom: "8px" }}>
        Welcome back, <span style={{ color: "#a78bfa" }}>{user?.name?.split(" ")[0]}!</span> 👋
      </h1>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Ready to dive back in? Create, explore, and master your next course with the power of AI.
      </p>
    </div>
  );
};

export default WelcomeBanner;