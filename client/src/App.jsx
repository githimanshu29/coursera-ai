import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import WorkspaceLayout from "./components/ui/layout/WorkspaceLayout.jsx";
import ProtectedRoute from "./components/ui/layout/ProtectedRoute.jsx";
import Dashboard from "./pages/workspace/Dashboard.jsx";
import Billing from "./pages/workspace/Billing.jsx";
import Profile from "./pages/workspace/Profile.jsx";import MyQuizzes from "./pages/workspace/MyQuizzes.jsx";

import EditCourse from "./pages/workspace/EditCourse.jsx";
import ViewCourse from "./pages/workspace/ViewCourse.jsx";
import CourseView from "./pages/course/CourseView.jsx";

import Landing from "./pages/LandingPage.jsx";
import StepBuildCourse from "./pages/workspace/StepBuilderCourse.jsx";

const App = () => {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* workspace routes — have sidebar layout */}

      <Route element={<WorkspaceLayout />}>
        <Route path="/workspace" element={<Dashboard />} />
        <Route
          path="/workspace/step-build/:courseId"
          element={<StepBuildCourse />}
        />
        <Route path="/workspace/billing" element={<Billing />} />        <Route path="/workspace/quizzes" element={<MyQuizzes />} />
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

      {/* course study route — has its OWN layout (no workspace sidebar) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/course/:courseId" element={<CourseView />} />
      </Route>
    </Routes>
  );
};

export default App;
