import Course from "../../models/Course.js";
import Enrollment from "../../models/Enrollment.js";

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // first delete all enrollments for this course
    await Enrollment.deleteMany({ cid: courseId });

    // then delete the course itself
    const deletedCourse = await Course.findOneAndDelete({ cid: courseId });

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("deleteCourse error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
      error: error.message,
    });
  }
};