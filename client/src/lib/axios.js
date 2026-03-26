import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5005/api",
  withCredentials: true,
});

// attach accessToken to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// if accessToken expired → auto refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "http://localhost:5005/api/auth/refresh-token",
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest); // retry original request
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // redirect to login
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
