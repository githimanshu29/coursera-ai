import axiosInstance from "./axios";

//Authentication bale endpoints
export const loginApi = (data) => axiosInstance.post("/auth/login", data);
export const registerApi = (data) => axiosInstance.post("/auth/register", data);
export const logoutApi = () => axiosInstance.post("/auth/logout");

//courses related endpoints
export const getUserCoursesApi = () =>
  axiosInstance.get("/courses/user-courses");
export const getCourseByIdApi = (courseId) =>
  axiosInstance.get(`/courses/${courseId}`);
export const generateCourseLayoutApi = (data) =>
  axiosInstance.post("/courses/generate-layout", data);
export const generateCourseContentApi = (courseId) =>
  axiosInstance.post(`/courses/generate-content/${courseId}`);
export const deleteCourseApi = (courseId) =>
  axiosInstance.delete(`/courses/${courseId}`);

//Enrollment bale endpoints
export const enrollCourseApi = (courseId) =>
  axiosInstance.post("/enrollments/enroll", { courseId });
export const getEnrolledCoursesApi = () => axiosInstance.get("/enrollments");
export const getEnrolledCourseByIdApi = (courseId) =>
  axiosInstance.get(`/enrollments/${courseId}`);
export const deleteEnrollmentApi = (enrollmentId) =>
  axiosInstance.delete(`/enrollments/${enrollmentId}`);

// ── QUIZ ─────────────────────────────────────────────────────
export const generateQuizApi = (courseId, chapterIndex) =>
  axiosInstance.get(`/quiz/generate/${courseId}/${chapterIndex}`);

export const submitQuizApi = (quizId, answers) =>
  axiosInstance.post("/quiz/submit", { quizId, answers });

export const skipQuizApi = (quizId) =>
  axiosInstance.post("/quiz/skip", { quizId });

export const retakeQuizApi = (quizId) =>
  axiosInstance.post("/quiz/retake", { quizId });

export const getCourseQuizStatusApi = (courseId) =>
  axiosInstance.get(`/quiz/status/${courseId}`);

export const getAccessToken = () => localStorage.getItem("accessToken");

// SSE connection — returns EventSource object
export const createChapterRAGStream = async (
  courseId,
  userInstruction = "",
) => {
  // ── refresh token first to ensure it's valid ──
  try {
    const refreshRes = await axiosInstance.post("/auth/refresh-token");
    const newToken = refreshRes.data.accessToken;
    localStorage.setItem("accessToken", newToken);
  } catch (err) {
    console.error("Token refresh failed:", err.message);
  }

  const token = localStorage.getItem("accessToken");
  const url = `http://localhost:5005/api/courses/generate-chapter-rag/${courseId}?token=${token}&userInstruction=${encodeURIComponent(userInstruction)}`;
  return new EventSource(url);
};
