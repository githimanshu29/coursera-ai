import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials, logout } from "../store/slices/authSlice.js";
import axiosInstance from "../lib/axios.js";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    dispatch(setCredentials({
      user: res.data.user,
      accessToken: res.data.accessToken,
    }));
    navigate("/workspace");
  };

  const register = async (name, email, password, gender, avatar) => {
    const res = await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
      gender,
      avatar,
    });
    dispatch(setCredentials({
      user: res.data.user,
      accessToken: res.data.accessToken,
    }));
    navigate("/workspace");
  };

  const logoutUser = async () => {
    await axiosInstance.post("/auth/logout");
    dispatch(logout());
    navigate("/login");
  };

  return { user, isAuthenticated, login, register, logoutUser };
};

export default useAuth;