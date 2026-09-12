import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ── Animated counter hook ─────────────────────────────────────────────────────
const useCounter = (end, duration = 2000, start = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [end, duration, start]);
    return count;
};

// ── Particle background ───────────────────────────────────────────────────────
const Particles = () => {
    const particles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.1,
    }));

    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {particles.map((p) => (
                <div key={p.id} style={{
                    position: "absolute",
                    left: `${p.x}%`, top: `${p.y}%`,
                    width: `${p.size}px`, height: `${p.size}px`,
                    borderRadius: "50%",
                    background: `rgba(167, 139, 250, ${p.opacity})`,
                    animation: `float ${p.duration}s ease-in-out infinite`,
                    animationDelay: `${p.delay}s`,
                }} />
            ))}
        </div>
    );
};

// ── Feature Card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, description, color, delay }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? `linear-gradient(135deg, rgba(124,58,237,0.15), rgba(109,40,217,0.08))` : "rgba(255,255,255,0.02)",
                border: `1px solid ${hovered ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "20px", padding: "28px",
                transition: "all 0.35s ease",
                transform: hovered ? "translateY(-6px)" : "translateY(0)",
                boxShadow: hovered ? "0 20px 40px rgba(124,58,237,0.15)" : "none",
                animation: `fadeUp 0.6s ease forwards`,
                animationDelay: delay, opacity: 0,
            }}
        >
            <div style={{
                width: "48px", height: "48px", borderRadius: "14px",
                background: `linear-gradient(135deg, ${color}30, ${color}15)`,
                border: `1px solid ${color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", marginBottom: "16px",
            }}>
                {icon}
            </div>
            <h3 style={{ color: "white", fontSize: "17px", fontWeight: "700", marginBottom: "10px", fontFamily: "'Sora', sans-serif" }}>
                {title}
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif" }}>
                {description}
            </p>
        </div>
    );
};

// ── Step Card ─────────────────────────────────────────────────────────────────
const StepCard = ({ number, title, description, delay }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative",
                background: hovered ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${hovered ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "20px", padding: "32px 28px",
                transition: "all 0.3s ease",
                animation: `fadeUp 0.6s ease forwards`,
                animationDelay: delay, opacity: 0,
            }}
        >
            <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "18px", fontWeight: "800", marginBottom: "20px",
                boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
                fontFamily: "'Sora', sans-serif",
            }}>
                {number}
            </div>
            <h3 style={{ color: "white", fontSize: "18px", fontWeight: "700", marginBottom: "12px", fontFamily: "'Sora', sans-serif" }}>
                {title}
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif" }}>
                {description}
            </p>
        </div>
    );
};

// ── Coming Soon Card ──────────────────────────────────────────────────────────
const ComingSoonCard = ({ icon, title, description, tag, color, delay }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? `linear-gradient(135deg, ${color}12, ${color}06)` : "rgba(255,255,255,0.015)",
                border: `1px solid ${hovered ? color + "50" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "20px", padding: "28px",
                transition: "all 0.35s ease",
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
                animation: `fadeUp 0.6s ease forwards`,
                animationDelay: delay, opacity: 0,
                position: "relative", overflow: "hidden",
            }}
        >
            <div style={{
                position: "absolute", top: "-30px", right: "-30px",
                width: "100px", height: "100px",
                background: `radial-gradient(circle, ${color}20, transparent 70%)`,
                borderRadius: "50%", pointerEvents: "none",
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{
                    width: "46px", height: "46px", borderRadius: "14px",
                    background: `${color}20`, border: `1px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                }}>
                    {icon}
                </div>
                <span style={{
                    padding: "4px 12px", borderRadius: "20px",
                    background: `${color}15`, border: `1px solid ${color}30`,
                    color: color, fontSize: "11px", fontWeight: "700",
                    letterSpacing: "0.5px", fontFamily: "'Sora', sans-serif",
                }}>
                    {tag}
                </span>
            </div>
            <h3 style={{ color: "white", fontSize: "17px", fontWeight: "700", marginBottom: "10px", fontFamily: "'Sora', sans-serif" }}>
                {title}
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif" }}>
                {description}
            </p>
        </div>
    );
};

// ── Main Landing Page ─────────────────────────────────────────────────────────
const Landing = () => {
    const [scrolled, setScrolled] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);

    const learners = useCounter(10000, 2000, statsVisible);
    const courses = useCounter(500, 2000, statsVisible);
    const success = useCounter(95, 2000, statsVisible);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.4 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    const features = [
        { icon: "⚡", title: "Instant Course Generation", description: "Transform any topic into a structured curriculum with AI-powered content generation in seconds.", color: "#a78bfa", delay: "0.1s" },
        { icon: "🎬", title: "Integrated Video Content", description: "Each chapter includes curated YouTube videos automatically fetched to enhance your learning.", color: "#60a5fa", delay: "0.2s" },
        { icon: "📖", title: "Comprehensive Material", description: "AI-generated rich HTML content for every topic, formatted for maximum readability and depth.", color: "#34d399", delay: "0.3s" },
        { icon: "📊", title: "Progress Tracking", description: "Track completed topics and chapters with a visual progress bar that updates in real-time.", color: "#f59e0b", delay: "0.4s" },
        { icon: "🗺️", title: "Course Roadmap", description: "Visual timeline of your entire course structure — chapters, topics, and learning path at a glance.", color: "#f472b6", delay: "0.5s" },
        { icon: "🎯", title: "Personalized Paths", description: "Choose your difficulty level, category, and chapter count. AI adapts the course to your goals.", color: "#a78bfa", delay: "0.6s" },
    ];

    const comingSoon = [
        { icon: "🎤", title: "AI Voice Interviewer", description: "Practice real interviews with an AI that speaks, listens, and gives instant feedback on your answers.", tag: "COMING SOON", color: "#a78bfa", delay: "0.1s" },
        { icon: "💬", title: "AI Assistant Chat", description: "Ask questions about any topic mid-lesson. Gemini answers scoped to exactly what you're studying.", tag: "COMING SOON", color: "#60a5fa", delay: "0.2s" },
        { icon: "🧠", title: "Chapter Quiz System", description: "Test your knowledge with AI-generated MCQs after each chapter. Track your score and improve.", tag: "COMING SOON", color: "#34d399", delay: "0.3s" },
        { icon: "📄", title: "Resume Analyser", description: "Upload your resume and get AI-powered feedback, skill gap analysis, and improvement suggestions.", tag: "COMING SOON", color: "#f59e0b", delay: "0.4s" },
    ];

    return (
        <div style={{ backgroundColor: "#07090f", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes float { 0%, 100% { transform: translateY(0px); opacity: 0.3; } 50% { transform: translateY(-20px); opacity: 0.6; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.05); opacity: 1; } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #07090f; }
        ::-webkit-scrollbar-thumb { background: #3b0764; border-radius: 3px; }
        .nav-link { color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: white; }
        .hero-btn-primary { padding: 14px 32px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #6d28d9); border: none; color: white; font-size: 15px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s; text-decoration: none; font-family: 'Sora', sans-serif; box-shadow: 0 8px 30px rgba(124,58,237,0.4); position: relative; overflow: hidden; }
        .hero-btn-primary::after { content: ''; position: absolute; top: 0; left: 0; width: 40px; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); animation: shimmer 2.5s infinite; }
        .hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.5); }
        .hero-btn-secondary { padding: 14px 32px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: white; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s; text-decoration: none; font-family: 'Sora', sans-serif; }
        .hero-btn-secondary:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }
        @media (max-width: 768px) {
          .hero-title { font-size: 38px !important; }
          .hero-subtitle { font-size: 16px !important; }
          .hero-buttons { flex-direction: column !important; align-items: stretch !important; }
          .hero-btn-primary, .hero-btn-secondary { justify-content: center; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .coming-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 12px !important; }
          .stat-number { font-size: 28px !important; }
          .nav-links { display: none !important; }
          .cta-title { font-size: 28px !important; }
          .section-title { font-size: 26px !important; }
        }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr !important; } .hero-title { font-size: 30px !important; } }
        @media (min-width: 769px) { .features-grid { grid-template-columns: repeat(3, 1fr) !important; } .coming-grid { grid-template-columns: repeat(2, 1fr) !important; } .steps-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (min-width: 1024px) { .coming-grid { grid-template-columns: repeat(4, 1fr) !important; } }
      `}</style>

            {/* ── Navbar ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "16px 0",
                background: scrolled ? "rgba(7,9,15,0.85)" : "transparent",
                backdropFilter: scrolled ? "blur(20px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
                transition: "all 0.3s ease",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span style={{ color: "white", fontWeight: "700", fontSize: "18px", letterSpacing: "-0.3px", fontFamily: "'Sora', sans-serif" }}>
                            Coursera<span style={{ color: "#a78bfa" }}>-AI</span>
                        </span>
                    </div>

                    <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#how-it-works" className="nav-link">How It Works</a>
                        <a href="#coming-soon" className="nav-link">Roadmap</a>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Link to="/login" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "color 0.2s", fontFamily: "'Sora', sans-serif" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                        >Sign In</Link>
                        <Link to="/register" className="hero-btn-primary" style={{ padding: "10px 22px", fontSize: "13px", borderRadius: "10px" }}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "120px 24px 80px", overflow: "hidden" }}>
                <Particles />
                <div style={{ position: "absolute", top: "10%", left: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "pulse 6s ease-in-out infinite" }} />
                <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "pulse 8s ease-in-out infinite 2s" }} />

                <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", borderRadius: "30px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", marginBottom: "28px", animation: "fadeIn 0.8s ease forwards", fontSize: "13px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", animation: "pulse 2s ease-in-out infinite", display: "inline-block" }} />
                        <span style={{ color: "#a78bfa", fontWeight: "600", fontFamily: "'Sora', sans-serif", letterSpacing: "0.3px" }}>✦ AI-Powered Learning Platform</span>
                    </div>

                    <h1 className="hero-title" style={{ fontSize: "62px", fontWeight: "800", lineHeight: "1.1", marginBottom: "24px", fontFamily: "'Sora', sans-serif", letterSpacing: "-1.5px", animation: "fadeUp 0.8s ease 0.2s forwards", opacity: 0 }}>
                        <span style={{ color: "white" }}>Learn Anything,</span>
                        <br />
                        <span style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed, #60a5fa)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gradientShift 4s ease infinite" }}>
                            Powered by AI
                        </span>
                    </h1>

                    <p className="hero-subtitle" style={{ fontSize: "18px", color: "#6b7280", lineHeight: "1.8", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px", fontFamily: "'DM Sans', sans-serif", animation: "fadeUp 0.8s ease 0.4s forwards", opacity: 0 }}>
                        Transform any topic into a comprehensive course with structured chapters, rich AI-generated content, and curated videos. Your personalized learning journey starts here.
                    </p>

                    <div className="hero-buttons" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap", animation: "fadeUp 0.8s ease 0.6s forwards", opacity: 0 }}>
                        <Link to="/register" className="hero-btn-primary">
                            Start Learning Free
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <a href="#how-it-works" className="hero-btn-secondary">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Watch Demo
                        </a>
                    </div>

                    <p style={{ color: "#374151", fontSize: "12px", marginTop: "24px", letterSpacing: "0.3px", animation: "fadeUp 0.8s ease 0.8s forwards", opacity: 0, fontFamily: "'DM Sans', sans-serif" }}>
                        🔒 Free to start · No credit card required · Powered by Gemini AI
                    </p>
                </div>
            </section>

            {/* ── Stats ── */}
            <section ref={statsRef} style={{ padding: "0 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
                <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                    {[
                        { value: learners, suffix: "K+", label: "Active Learners", icon: "👥" },
                        { value: courses, suffix: "+", label: "Courses Created", icon: "📚" },
                        { value: success, suffix: "%", label: "Success Rate", icon: "📈" },
                    ].map((stat, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px 24px", textAlign: "center", transition: "border-color 0.3s" }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
                        >
                            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
                            <div className="stat-number" style={{ fontSize: "38px", fontWeight: "800", color: "white", lineHeight: "1", fontFamily: "'Sora', sans-serif", letterSpacing: "-1px" }}>
                                {stat.value > 1000 ? `${Math.floor(stat.value / 1000)}` : stat.value}{stat.suffix}
                            </div>
                            <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px", fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "56px" }}>
                    <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Sora', sans-serif", display: "block", marginBottom: "12px" }}>FEATURES</span>
                    <h2 className="section-title" style={{ color: "white", fontSize: "36px", fontWeight: "800", marginBottom: "16px", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.8px" }}>
                        Everything You Need to Master Any Skill
                    </h2>
                    <p style={{ color: "#6b7280", fontSize: "16px", maxWidth: "520px", margin: "0 auto", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif" }}>
                        Powerful features designed to accelerate your learning journey
                    </p>
                </div>
                <div className="features-grid" style={{ display: "grid", gap: "20px" }}>
                    {features.map((f, i) => <FeatureCard key={i} {...f} />)}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" style={{ padding: "80px 24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "56px" }}>
                        <span style={{ color: "#60a5fa", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Sora', sans-serif", display: "block", marginBottom: "12px" }}>HOW IT WORKS</span>
                        <h2 className="section-title" style={{ color: "white", fontSize: "36px", fontWeight: "800", marginBottom: "16px", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.8px" }}>
                            Three Steps to Start Learning
                        </h2>
                        <p style={{ color: "#6b7280", fontSize: "16px", maxWidth: "480px", margin: "0 auto", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif" }}>
                            From idea to full course in minutes
                        </p>
                    </div>
                    <div className="steps-grid" style={{ display: "grid", gap: "20px" }}>
                        <StepCard number="01" title="Choose Your Topic" description="Enter any subject you want to master — from quantum physics to digital marketing, SQL to football tactics." delay="0.1s" />
                        <StepCard number="02" title="AI Generates Course" description="Our AI structures chapters, writes comprehensive content, and curates relevant YouTube videos for each topic." delay="0.2s" />
                        <StepCard number="03" title="Start Learning" description="Dive into your personalized course, track your progress, and master new skills chapter by chapter." delay="0.3s" />
                    </div>
                </div>
            </section>

            {/* ── Coming Soon ── */}
            <section id="coming-soon" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "56px" }}>
                    <span style={{ color: "#34d399", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Sora', sans-serif", display: "block", marginBottom: "12px" }}>ROADMAP</span>
                    <h2 className="section-title" style={{ color: "white", fontSize: "36px", fontWeight: "800", marginBottom: "16px", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.8px" }}>
                        The Future of Coursera-AI
                    </h2>
                    <p style={{ color: "#6b7280", fontSize: "16px", maxWidth: "520px", margin: "0 auto", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif" }}>
                        Powerful features in active development — coming very soon
                    </p>
                </div>
                <div className="coming-grid" style={{ display: "grid", gap: "20px" }}>
                    {comingSoon.map((f, i) => <ComingSoonCard key={i} {...f} />)}
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto 80px" }}>
                <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(96,165,250,0.08))", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "28px", padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
                    <div style={{ fontSize: "52px", marginBottom: "16px", animation: "pulse 3s ease-in-out infinite" }}>🤖</div>
                    <h2 className="cta-title" style={{ color: "white", fontSize: "36px", fontWeight: "800", marginBottom: "16px", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.8px", position: "relative" }}>
                        Ready to Transform Your Learning?
                    </h2>
                    <p style={{ color: "#6b7280", fontSize: "16px", maxWidth: "480px", margin: "0 auto 36px", lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif", position: "relative" }}>
                        Join thousands of learners who are mastering new skills with AI-powered courses
                    </p>
                    <Link to="/register" className="hero-btn-primary" style={{ position: "relative" }}>
                        Get Started Now
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span style={{ color: "white", fontWeight: "700", fontSize: "16px", fontFamily: "'Sora', sans-serif" }}>
                        Coursera<span style={{ color: "#a78bfa" }}>-AI</span>
                    </span>
                </div>
                <p style={{ color: "#374151", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" }}>
                    © 2025 Coursera-AI · Built with ❤️ and Gemini AI
                </p>
            </footer>
        </div>
    );
};

export default Landing;