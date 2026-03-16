import Enrollment from "../../models/Enrollment.js";
import Course from "../../models/Course.js";

// ── GET SINGLE ENROLLED COURSE ───────────────────────────────────────────────
export const getEnrolledCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    // find enrollment
    const enrollment = await Enrollment.findOne({
      cid: courseId,
      userId: req.user._id,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // get course details
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
      enrollment,
    });
  } catch (error) {
    console.error("getEnrolledCourseById error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled course",
      error: error.message,
    });
  }
};

// ── GET ALL ENROLLED COURSES ─────────────────────────────────────────────────
export const getEnrolledCourses = async (req, res) => {
  try {
    // find all enrollments for this user
    const enrollments = await Enrollment.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (!enrollments.length) {
      return res.status(200).json({
        success: true,
        courses: [],
      });
    }

    // extract all cids from enrollments
    const courseIds = enrollments.map((e) => e.cid);

    // fetch all courses in one query
    const courses = await Course.find({ cid: { $in: courseIds } });

    // merge course details with enrollment progress
    const result = enrollments.map((enrollment) => {
      const course = courses.find((c) => c.cid === enrollment.cid);
      return {
        course,
        enrollment,
      };
    });

    res.status(200).json({
      success: true,
      courses: result,
    });
  } catch (error) {
    console.error("getEnrolledCourses error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
      error: error.message,
    });
  }
};