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

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#0a0f1e",
      fontFamily: "'Inter', sans-serif",
    }}>
      <Sidebar />

      <div style={{
        marginLeft: "240px",
        flex: 1,
        padding: "32px",
        minHeight: "100vh",
      }}>
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