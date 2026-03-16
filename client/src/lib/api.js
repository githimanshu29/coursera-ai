import axiosInstance from "./axios";

//Authentication bale endpoints
export const loginApi = (data)=> axiosInstance.post("/auth/login", data);
export const registerApi = (data) => axiosInstance.post("/auth/register", data);
export const logoutApi = () => axiosInstance.post("/auth/logout");

//courses related endpoints
export const getUserCoursesApi = () => axiosInstance.get("/courses/user-courses");
export const getCourseByIdApi = (courseId) => axiosInstance.get(`/courses/${courseId}`);
export const generateCourseLayoutApi = (data) => axiosInstance.post("/courses/generate-layout", data);
export const generateCourseContentApi = (courseId) => axiosInstance.post(`/courses/generate-content/${courseId}`);
export const deleteCourseApi = (courseId) => axiosInstance.delete(`/courses/${courseId}`);


//Enrollment bale endpoints
export const enrollCourseApi = (courseId) => axiosInstance.post("/enrollments/enroll", { courseId });
export const getEnrolledCoursesApi = () => axiosInstance.get("/enrollments");
export const getEnrolledCourseByIdApi = (courseId) => axiosInstance.get(`/enrollments/${courseId}`);
export const deleteEnrollmentApi = (enrollmentId) => axiosInstance.delete(`/enrollments/${enrollmentId}`);

