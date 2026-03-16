import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCourseByIdApi, getEnrolledCourseByIdApi } from "../../lib/api.js";
import axiosInstance from "../../lib/axios.js";
import ChapterSidebar from "./_components/ChapterSidebar.jsx";
import ChapterContent from "./_components/ChapterContent.jsx";

const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);

  // ── fetch course ──────────────────────────────────────────────────────────
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await getCourseByIdApi(courseId);
      return res.data.course;
    },
  });

  // ── fetch enrollment ──────────────────────────────────────────────────────
  const {
    data: enrollmentData,
    refetch: refetchEnrollment,
  } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: async () => {
      const res = await getEnrolledCourseByIdApi(courseId);
      return res.data.enrollment;
    },
  });

  // ── mark topic complete ───────────────────────────────────────────────────
  const markCompleteMutation = useMutation({
    mutationFn: async ({ chapterIndex, topicIndex }) => {
      const topicKey = `${chapterIndex}_${topicIndex}`;
      await axiosInstance.post(`/enrollments/complete-topic`, {
        courseId,
        topicKey,
      });
    },
    onSuccess: () => refetchEnrollment(),
  });

  const handleTopicClick = (chapterIndex, topicIndex) => {
    setActiveChapterIndex(chapterIndex);
    setActiveTopicIndex(topicIndex);
  };

  const handleMarkComplete = (chapterIndex, topicIndex) => {
    markCompleteMutation.mutate({ chapterIndex, topicIndex });
  };

  if (courseLoading) return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0a0f1e",
      display: "flex", alignItems: "center",
      justifyContent: "center",
      flexDirection: "column", gap: "16px",
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid rgba(124,58,237,0.3)",
        borderTop: "3px solid #7c3aed",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#6b7280", fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
        Loading course...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0a0f1e",
      display: "flex",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* sidebar */}
      <ChapterSidebar
        course={course}
        enrollment={enrollmentData}
        activeChapterIndex={activeChapterIndex}
        activeTopicIndex={activeTopicIndex}
        onTopicClick={handleTopicClick}
      />

      {/* main content */}
      <div style={{
        marginLeft: "300px",
        flex: 1,
        padding: "40px",
        minHeight: "100vh",
      }}>

        {/* top navbar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}>
          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              borderRadius: "8px",
              display: "flex", alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>
              Coursera<span style={{ color: "#a78bfa" }}>-AI</span>
            </span>
          </div>

          {/* home button */}
          <button
            onClick={() => navigate("/workspace")}
            style={{
              width: "36px", height: "36px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#6b7280", cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(124,58,237,0.15)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>

        {/* chapter content */}
        <ChapterContent
          course={course}
          activeChapterIndex={activeChapterIndex}
          activeTopicIndex={activeTopicIndex}
          onMarkComplete={handleMarkComplete}
        />
      </div>
    </div>
  );
};

export default CourseView;