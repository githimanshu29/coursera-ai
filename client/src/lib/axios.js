import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://coursera-ai.onrender.com/api",
  withCredentials: true, // sends cookies (refreshToken) automatically
});

// attach accessToken, custom Gemini key and model to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const customGeminiKey = localStorage.getItem("customGeminiKey");
  if (customGeminiKey) {
    config.headers["x-gemini-key"] = customGeminiKey;
  }

  const customGeminiModel = localStorage.getItem("customGeminiModel");
  if (customGeminiModel) {
    config.headers["x-gemini-model"] = customGeminiModel;
  }

  return config;
});

// if accessToken expired → auto refresh
// Track usage for free tier users (BYOK)
const trackUsage = (response) => {
  const url = response.config.url || "";
  const model = response.config.headers["x-gemini-model"];
  const key = response.config.headers["x-gemini-key"];
  
  // Only track if they are using their own key and it's a generate route
  if (key && model && (url.includes("/courses/generate-layout") || url.includes("/courses/generate-content") || url.includes("/quiz/generate"))) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let usage = {};
    try {
      usage = JSON.parse(localStorage.getItem("geminiUsage") || "{}");
    } catch (e) {}

    if (!usage[today]) usage[today] = {};
    if (!usage[today][model]) usage[today][model] = 0;
    
    usage[today][model] += 1;
    localStorage.setItem("geminiUsage", JSON.stringify(usage));
    
    // Dispatch custom event so Billing UI can update in real-time
    window.dispatchEvent(new Event("geminiUsageUpdated"));
  }
  return response;
};

// if accessToken expired → auto refresh
axiosInstance.interceptors.response.use(
  (response) => trackUsage(response),
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "https://coursera-ai.onrender.com/api/auth/refresh-token",
          {},
          { withCredentials: true }
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
  }
);

export default axiosInstance;
