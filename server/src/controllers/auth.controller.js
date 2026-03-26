import User from "../models/User.js";
import jwt from "jsonwebtoken";

// helper functions to generate tokens
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, gender, avatar } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // create user (password auto hashed by pre save hook)
    const user = await User.create({
      name,
      email,
      password,
      gender,
      avatar,
    });

    // 🚨 Safety check
    if (!user || !user._id) {
      return res.status(500).json({
        success: false,
        message: "User creation failed",
      });
    }

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    // generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite:
        process.env.NODE_ENV === "production" // cross-domain in prod
          ? "none"
          : "lax",
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,

      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Provide valide email and password",
      });
    }
    // check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. user exizt",
      });
    }

    // check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    //set refreshToken into cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite:
        process.env.NODE_ENV === "production" // cross-domain in prod
          ? "none"
          : "lax",
      path: "/",
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error, login unsuccessful",
      error: error.message,
    });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    // verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // find user and check if refresh token matches
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // generate new access token
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite:
        process.env.NODE_ENV === "production" // cross-domain in prod
          ? "none"
          : "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      error: error.message,
    });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken: refreshToken });

      if (user) {
        user.refreshToken = null; //this makes user logout
        await user.save();
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
