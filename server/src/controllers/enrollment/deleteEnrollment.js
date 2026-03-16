import Enrollment from "../../models/Enrollment.js";

export const deleteEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: "Enrollment ID is required",
      });
    }

    const deletedEnrollment = await Enrollment.findByIdAndDelete(enrollmentId);

    if (!deletedEnrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("deleteEnrollment error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete enrollment",
      error: error.message,
    });
  }
};