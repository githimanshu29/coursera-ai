import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getUserCoursesApi,
  getEnrolledCoursesApi,
  deleteCourseApi,
  enrollCourseApi,
  deleteEnrollmentApi,
} from "../../lib/api.js";
import WelcomeBanner from "./_components/WelcomeBanner.jsx";
import CourseCard from "./_components/CourseCard.jsx";
import EnrolledCourseCard from "./_components/EnrolledCourseCard.jsx";
import SkeletonCard from "./_components/SkeletonCard.jsx";
import CreateCourseDialog from "./_components/CreateCourseDialog.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ── fetch user courses ────────────────────────────────────────────────────
  const {
    data: coursesData,
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ["userCourses"],
    queryFn: async () => {
      const res = await getUserCoursesApi();
      return res.data.courses;
    },
  });

  // ── fetch enrolled courses ────────────────────────────────────────────────
  const {
    data: enrolledData,
    isLoading: enrolledLoading,
    refetch: refetchEnrolled,
  } = useQuery({
    queryKey: ["enrolledCourses"],
    queryFn: async () => {
      const res = await getEnrolledCoursesApi();
      return res.data.courses;
    },
  });

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourseApi(courseId);
      refetchCourses();
    } catch (err) {
      console.error("Delete course error:", err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollCourseApi(courseId);
      refetchEnrolled();
      refetchCourses();
    } catch (err) {
      console.error("Enroll error:", err);
    }
  };

  const handleGenerateContent = (courseId) => {
    navigate(`/workspace/edit-course/${courseId}`);
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    try {
      await deleteEnrollmentApi(enrollmentId);
      refetchEnrolled();
    } catch (err) {
      console.error("Delete enrollment error:", err);
    }
  };

  const handleContinueBuilding = (courseId) => {
    navigate(`/workspace/step-build/${courseId}`);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* welcome banner */}
      <WelcomeBanner />

      {/* ── Continue Learning section ── */}
      {(enrolledLoading || enrolledData?.length > 0) && (
        <div style={{ marginBottom: "40px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>
              Continue Learning
            </h2>
            <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
              Pick up where you left off
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {enrolledLoading
              ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
              : enrolledData?.map((item, i) => (
                  <EnrolledCourseCard
                    key={i}
                    item={item}
                    onDelete={handleDeleteEnrollment}
                  />
                ))}
          </div>
        </div>
      )}

      {/* ── My Courses section ── */}
      <div>
        {/* section header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h2 style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>
              My Courses
            </h2>
            <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
              Manage and explore your learning materials
            </p>
          </div>

          {/* new course button */}
          <button
            onClick={() => setIsDialogOpen(true)}
            style={{
              padding: "9px 16px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Course
          </button>
        </div>

        {/* loading state */}
        {coursesLoading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* empty state */}
        {!coursesLoading && coursesData?.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.08)",
              borderRadius: "16px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
            <h3
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              No courses yet
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Create your first AI-powered course to get started
            </p>
            <button
              onClick={() => setIsDialogOpen(true)}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                border: "none",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              + Create Course
            </button>
          </div>
        )}

        {/* courses grid */}
        {!coursesLoading && coursesData?.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {coursesData?.map((course, i) => (
              <CourseCard
                key={i}
                course={course}
                onDelete={handleDeleteCourse}
                onEnroll={handleEnroll}
                onGenerateContent={handleGenerateContent}
                onContinueBuilding={handleContinueBuilding}
              />
            ))}
          </div>
        )}
      </div>

      {/* create course dialog */}
      <CreateCourseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          setIsDialogOpen(false);
          refetchCourses();
        }}
      />
    </div>
  );
};

export default Dashboard;
