import Enrollment from "../../models/Enrollment.js";
import Course from "../../models/Course.js";

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      cid: courseId,
      userId: req.user._id,
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // enroll
    const enrollment = await Enrollment.create({
      cid: courseId,
      userId: req.user._id,
      completedChapters: [],
    });

    res.status(201).json({
      success: true,
      message: "Course enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.error("enrollCourse error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to enroll in course",
      error: error.message,
    });
  }
};