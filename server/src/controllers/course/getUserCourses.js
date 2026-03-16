import Course from "../../models/Course.js";
//get single course by courseId (cid)
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ cid: courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("getCourseById error(from getCourseById):", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: error.message,
    });
  }
};


// sare cpurses k lie
export const getUserCourses = async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user._id }).sort({
      createdAt: -1, // latest first
    });

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("getUserCourses error(cannot get courses from getUserCourses):", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};