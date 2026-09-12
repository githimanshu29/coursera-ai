import Enrollment from "../../models/Enrollment.js";
import Course from "../../models/Course.js";

export const completeTopic = async (req, res) => {
  try {
    const { courseId, topicKey } = req.body;

    // ✅ use findOneAndUpdate — avoids the undefined field issue completely
    const enrollment = await Enrollment.findOneAndUpdate(
      {
        cid: courseId,
        userId: req.user._id,
      },
      {
        $addToSet: { completedTopics: topicKey }, // adds only if not already there
      },
      {
        new: true, // return updated document
        upsert: false,
      }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // recalculate progress
    const course = await Course.findOne({ cid: courseId });
    const totalTopics = course?.courseJson?.chapters?.reduce(
      (acc, ch) => acc + (ch.topics?.length || 0), 0
    );

    const progress = totalTopics > 0
      ? Math.round((enrollment.completedTopics.length / totalTopics) * 100)
      : 0;

    // update progress separately
    await Enrollment.findByIdAndUpdate(enrollment._id, { progress });

    res.status(200).json({
      success: true,
      message: "Topic marked as complete",
      enrollment: { ...enrollment.toObject(), progress },
    });
  } catch (error) {
    console.error("completeTopic error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to mark topic complete",
      error: error.message,
    });
  }
};