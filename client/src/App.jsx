import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import WorkspaceLayout from "./components/ui/layout/WorkspaceLayout.jsx";
import ProtectedRoute from "./components/ui/layout/ProtectedRoute.jsx";
import Dashboard from "./pages/workspace/Dashboard.jsx";

import EditCourse from "./pages/workspace/EditCourse.jsx";
import ViewCourse from "./pages/workspace/ViewCourse.jsx";
import CourseView from "./pages/course/CourseView.jsx";
const Landing = () => <div style={{ color: "white", padding: "40px" }}>Landing Page</div>;

const App = () => {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* workspace routes — have sidebar layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<WorkspaceLayout />}>
          <Route path="/workspace" element={<Dashboard />} />
          <Route path="/workspace/my-learning" element={<Dashboard />} />
          <Route path="/workspace/explore" element={<Dashboard />} />
          <Route path="/workspace/ai-tools" element={<Dashboard />} />
          <Route path="/workspace/billing" element={<Dashboard />} />
          <Route path="/workspace/profile" element={<Dashboard />} />
          <Route path="/workspace/edit-course/:courseId" element={<EditCourse />} />
          <Route path="/workspace/view-course/:courseId" element={<ViewCourse />} />
        </Route>
      </Route>

      {/* course study route — has its OWN layout (no workspace sidebar) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/course/:courseId" element={<CourseView />} />
      </Route>

    </Routes>
  );
};

export default App;