const SkeletonCard = () => {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      {/* status badge skeleton */}
      <div style={{
        height: "22px", width: "40%",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "20px",
        animation: "pulse 1.5s ease-in-out infinite",
      }} />

      {/* title skeleton */}
      <div style={{
        height: "16px", width: "90%",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "6px",
        animation: "pulse 1.5s ease-in-out infinite",
      }} />

      {/* description skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{
          height: "12px", width: "100%",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "6px",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
        <div style={{
          height: "12px", width: "70%",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "6px",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      </div>

      {/* button skeleton */}
      <div style={{
        height: "38px", width: "100%",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "10px",
        marginTop: "4px",
        animation: "pulse 1.5s ease-in-out infinite",
      }} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default SkeletonCard;