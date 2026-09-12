import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import CreateCourseDialog from "../../../pages/workspace/_components/CreateCourseDialog.jsx";
import { useSelector,useDispatch } from "react-redux";
import { closeCreateCourse } from "../../../store/slices/courseSlice.js";
import { useQueryClient } from "@tanstack/react-query";



const WorkspaceLayout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const isDialogOpen = useSelector((state) => state.course.isCreateCourseOpen);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setSidebarOpen(false);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#0a0f1e",
      fontFamily: "'Inter', sans-serif",
    }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <div style={{
        marginLeft: isMobile ? "0" : "240px",
        flex: 1,
        padding: isMobile ? "16px" : "32px",
        minHeight: "100vh",
        transition: "margin-left 0.3s ease",
      }}>
        {/* mobile hamburger button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "8px 14px",
              color: "white",
              cursor: "pointer",
              marginBottom: "16px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>
        )}
        <Outlet />
      </div>

      {/* dialog lives here — accessible from anywhere in workspace */}
      <CreateCourseDialog
        isOpen={isDialogOpen}
        onClose={() => dispatch(closeCreateCourse())}
        onSuccess={() => {
          dispatch(closeCreateCourse());
          queryClient.invalidateQueries(["userCourses"]);
        }}
      />
    </div>
  );
};

export default WorkspaceLayout;