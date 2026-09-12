import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../lib/logger.js";

const protectSSE = async (req, res, next) => {
  try {
    const token = req.query.token;

    if (!token) {
      res.setHeader("Content-Type", "text/event-stream");
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: "No token provided" })}\n\n`,
      );
      return res.end();
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken",
    );

    if (!user) {
      res.setHeader("Content-Type", "text/event-stream");
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: "User not found" })}\n\n`,
      );
      return res.end();
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`protectSSE error: ${error.message}`);
    res.setHeader("Content-Type", "text/event-stream");
    res.write(
      `event: error\ndata: ${JSON.stringify({ message: "Invalid token" })}\n\n`,
    );
    res.end();
  }
};

export default protectSSE;
