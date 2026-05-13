import axios from "axios";
import axiosInstance from "./axios";

//Authentication bale endpoints
export const loginApi = (data) => axiosInstance.post("/auth/login", data);
export const registerApi = (data) => axiosInstance.post("/auth/register", data);
export const logoutApi = () => axiosInstance.post("/auth/logout");

//courses related endpoints
export const getUserCoursesApi = () =>
  axiosInstance.get("/courses/user-courses");
export const getPreviewCoursesApi = () => axiosInstance.get("/courses/preview");
export const getCourseByIdApi = (courseId) =>
  axiosInstance.get(`/courses/${courseId}`);
export const generateCourseLayoutApi = (data) =>
  axiosInstance.post("/courses/generate-layout", data);
export const generateCourseContentApi = (courseId, data = {}) =>
  axiosInstance.post(`/courses/generate-content/${courseId}`, data);
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
export const generateQuizApi = (courseId, chapterIndex, options = {}) =>
  axiosInstance.get(`/quiz/generate/${courseId}/${chapterIndex}`, {
    params: {
      provider: options.provider,
      model: options.model,
    },
  });

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
  modelProvider = "groq",
  modelName = "llama-3.3-70b-versatile",
) => {
  // ── refresh token first to ensure it's valid ──
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5005/api";
    const refreshRes = await axios.post(
      `${baseUrl}/auth/refresh-token`,
      {},
      { withCredentials: true },
    );
    const newToken = refreshRes.data.accessToken;
    localStorage.setItem("accessToken", newToken);
  } catch (err) {
    console.error("Token refresh failed:", err.message);
  }

  const token = localStorage.getItem("accessToken");
  const url = `${import.meta.env.VITE_API_URL || "http://localhost:5005/api"}/courses/generate-chapter-rag/${courseId}?token=${token}&userInstruction=${encodeURIComponent(userInstruction)}&provider=${encodeURIComponent(modelProvider)}&model=${encodeURIComponent(modelName)}`;
  return new EventSource(url);
};
