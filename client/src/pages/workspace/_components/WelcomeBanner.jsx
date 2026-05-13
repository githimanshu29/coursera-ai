// import { useSelector } from "react-redux";

// const WelcomeBanner = () => {
//   const { user } = useSelector((state) => state.auth);

//   return (
//     <div
//       className="welcome-banner"
//       style={{
//         background:
//           "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(109,40,217,0.05))",
//         border: "1px solid rgba(124,58,237,0.2)",
//         borderRadius: "16px",
//         padding: "28px 32px",
//         marginBottom: "32px",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       <style>{`
//         @keyframes bannerMarquee {
//           0% { transform: translateX(-5%); }
//           100% { transform: translateX(5%); }
//         }
//       `}</style>
//       {/* bg glow */}
//       <div
//         style={{
//           position: "absolute",
//           top: "-40px",
//           right: "-40px",
//           width: "200px",
//           height: "200px",
//           background:
//             "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
//           borderRadius: "50%",
//           pointerEvents: "none",
//         }}
//       />

//       <h1
//         style={{
//           color: "white",
//           fontSize: "26px",
//           fontWeight: "700",
//           marginBottom: "8px",
//         }}
//       >
//         Welcome back,{" "}
//         <span style={{ color: "#a78bfa" }}>{user?.name?.split(" ")[0]}!</span>{" "}
//         👋
//       </h1>
//       <p style={{ color: "#6b7280", fontSize: "14px" }}>
//         Ready to dive back in? Create, explore, and master your next course with
//         the power of AI.
//       </p>
//       <div style={{ marginTop: "14px", overflow: "hidden" }}>
//         <div
//           style={{
//             overflow: "hidden",
//             width: "100%",
//           }}
//         >
//           <div
//             style={{
//               color: "#fbbf22",
//               fontSize: "12px",
//               fontWeight: "600",
//               whiteSpace: "nowrap",
//               display: "inline-block",
//               animation: "bannerMarquee 4s linear infinite",
//             }}
//           >
//             For better use and to save API credit use RAG mode to build courses.
//           </div>
//         </div>
//         <div
//           style={{
//             overflow: "hidden",
//             width: "100%",
//           }}
//         >
//           <div
//             style={{
//               color: "#fbbf22",
//               fontSize: "12px",
//               fontWeight: "600",
//               whiteSpace: "nowrap",
//               display: "inline-block",
//               animation: "bannerMarquee 4s linear infinite",
//             }}
//           >
//             Credits gone! Use preview courses.
//           </div>
//         </div>

//         <div
//           style={{
//             overflow: "hidden",
//             width: "100%",
//           }}
//         >
//           <div
//             style={{
//               color: "#fbbf22",
//               fontSize: "15px",
//               fontWeight: "600",
//               whiteSpace: "nowrap",
//               display: "inline-block",
//               font: "revert",

//               padding: "4px",
//             }}
//           >
//             For true course generation and actual learning use gemini models,
//             but they less token limit.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WelcomeBanner;

import { useSelector } from "react-redux";

const WelcomeBanner = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div
      className="welcome-banner"
      style={{
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(109,40,217,0.05))",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: "16px",
        padding: "16px 24px",
        marginBottom: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Instrument+Sans:wght@400;500&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0px rgba(251,191,36,0); }
          50%       { box-shadow: 0 0 10px rgba(251,191,36,0.18); }
        }

        @keyframes rowDrift {
          0% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          100% { transform: translateX(-2px); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }

        .notif-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 6px 10px;
          border-radius: 8px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.06);
          animation: fadeSlideUp 0.5s ease forwards, glowPulse 3s ease-in-out infinite, rowDrift 8s ease-in-out infinite;
          opacity: 0;
        }
        .notif-row:nth-child(1) { animation-delay: 0.1s, 0s; }
        .notif-row:nth-child(2) { animation-delay: 0.22s, 0.6s; }
        .notif-row:nth-child(3) { animation-delay: 0.34s, 1.2s; }

        .notif-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
          animation: dotBlink 2s ease-in-out infinite;
        }

        .notif-label {
          font-family: 'Syne', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .notif-text {
          font-family: 'Instrument Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1.55;
          letter-spacing: 0.01em;
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            #fbbf24 0%,
            #fde68a 40%,
            #fbbf24 60%,
            #f59e0b 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* bg glow */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "200px",
          height: "200px",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <h1
        style={{
          color: "white",
          fontSize: "26px",
          fontWeight: "700",
          marginBottom: "8px",
        }}
      >
        Welcome back,{" "}
        <span style={{ color: "#a78bfa" }}>{user?.name?.split(" ")[0]}!</span>{" "}
        👋
      </h1>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Ready to dive back in? Create, explore, and master your next course with
        the power of AI.
      </p>

      {/* ── Notification notes ── */}
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {/* Note 1 */}
        <div className="notif-row">
          <span
            className="notif-dot"
            style={{ background: "#34d399", animationDelay: "0s" }}
          />
          <span
            className="notif-label"
            style={{
              color: "#34d399",
              background: "rgba(52,211,153,0.12)",
              border: "1px solid rgba(52,211,153,0.25)",
            }}
          >
            Tip
          </span>
          <span className="notif-text" style={{ color: "#d1fae5" }}>
            For better use and to save API credits, use{" "}
            <span style={{ color: "#34d399", fontWeight: "600" }}>
              RAG mode
            </span>{" "}
            to build courses.
          </span>
        </div>

        {/* Note 2 */}
        <div className="notif-row">
          <span
            className="notif-dot"
            style={{ background: "#fb923c", animationDelay: "0.7s" }}
          />
          <span
            className="notif-label"
            style={{
              color: "#fb923c",
              background: "rgba(251,146,60,0.12)",
              border: "1px solid rgba(251,146,60,0.25)",
            }}
          >
            Alert
          </span>
          <span className="notif-text shimmer-text">
            Credits gone! Use preview courses.
          </span>
        </div>

        {/* Note 3 */}
        <div className="notif-row">
          <span
            className="notif-dot"
            style={{ background: "#818cf8", animationDelay: "1.4s" }}
          />
          <span
            className="notif-label"
            style={{
              color: "#818cf8",
              background: "rgba(129,140,248,0.12)",
              border: "1px solid rgba(129,140,248,0.25)",
            }}
          >
            Note
          </span>
          <span className="notif-text" style={{ color: "#e0e7ff" }}>
            For true course generation use{" "}
            <span style={{ color: "#818cf8", fontWeight: "600" }}>
              Gemini models
            </span>{" "}
            — but note the lower token limit.
            <span style={{ color: "#818cf8", fontWeight: "600" }}>
              {" "}
              Preview courses are built with Gemini 🔥
            </span>
          </span>
        </div>

        {/* Note 4 */}
        <div className="notif-row">
          <span
            className="notif-dot"
            style={{ background: "#818cf8", animationDelay: "1.4s" }}
          />
          <span
            className="notif-label"
            style={{
              color: "#818cf8",
              background: "rgba(129,140,248,0.12)",
              border: "1px solid rgba(129,140,248,0.25)",
            }}
          >
            Note
          </span>
          <span className="notif-text" style={{ color: "#e0e7ff" }}>
            To attemp quizes click on{" "}
            <span style={{ color: "#818cf8", fontWeight: "600" }}>quiz</span> —
            button which is at last topic of the chapter in sidebar. Use {""}{" "}
            <span style={{ color: "#818cf8", fontWeight: "600" }}>GROQ</span>{" "}
            for quiz generation.
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
