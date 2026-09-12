import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import WorkspaceLayout from "./components/ui/layout/WorkspaceLayout.jsx";
import ProtectedRoute from "./components/ui/layout/ProtectedRoute.jsx";
import Dashboard from "./pages/workspace/Dashboard.jsx";
import Billing from "./pages/workspace/Billing.jsx";
import Profile from "./pages/workspace/Profile.jsx";
import MyQuizzes from "./pages/workspace/MyQuizzes.jsx";
import EditCourse from "./pages/workspace/EditCourse.jsx";
import ViewCourse from "./pages/workspace/ViewCourse.jsx";
import CourseView from "./pages/course/CourseView.jsx";
import Landing from "./pages/LandingPage.jsx";
import StepBuildCourse from "./pages/workspace/StepBuilderCourse.jsx";
import { setCredentials, logout } from "./store/slices/authSlice.js";
import { getMeApi } from "./lib/api.js";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Re-hydrate user from server on page refresh (token persists but user object doesn't)
  useEffect(() => {
    if (isAuthenticated && !user) {
      getMeApi()
        .then((res) => {
          if (res.data.success) {
            dispatch(
              setCredentials({
                user: res.data.user,
                accessToken: localStorage.getItem("accessToken"),
              })
            );
          }
        })
        .catch(() => {
          dispatch(logout());
        });
    }
  }, [isAuthenticated, user, dispatch]);

  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* workspace routes - have sidebar layout */}
      <Route element={<WorkspaceLayout />}>
        <Route path="/workspace" element={<Dashboard />} />
        <Route
          path="/workspace/step-build/:courseId"
          element={<StepBuildCourse />}
        />
        <Route path="/workspace/billing" element={<Billing />} />
        <Route path="/workspace/quizzes" element={<MyQuizzes />} />
        <Route path="/workspace/profile" element={<Profile />} />
        <Route
          path="/workspace/edit-course/:courseId"
          element={<EditCourse />}
        />
        <Route
          path="/workspace/view-course/:courseId"
          element={<ViewCourse />}
        />
      </Route>

      {/* course study route - has its OWN layout (no workspace sidebar) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/course/:courseId" element={<CourseView />} />
      </Route>
    </Routes>
  );
};

export default App;
