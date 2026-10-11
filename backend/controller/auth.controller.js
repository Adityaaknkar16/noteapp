import User from "../models/user.model.js";
import { errorHandler } from "../utilies/error.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.FRONTEND_URL?.startsWith("https") ||
  process.env.CLIENT_URL?.startsWith("https");

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, "All fields (username, email, password) are required"));
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return next(errorHandler(400, "Email is already registered"));
      }
      return next(errorHandler(400, "Username is already taken"));
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return next(errorHandler(400, `An account with this ${field} already exists`));
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, "Email and password are required"));
  }

  try {
    const validUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("CRITICAL: JWT_SECRET environment variable is missing!");
      return next(errorHandler(500, "Server configuration error: missing JWT_SECRET"));
    }

    const token = jwt.sign({ id: validUser._id }, jwtSecret, { expiresIn: "7d" });

    const { password: pass, ...rest } = validUser._doc;

    res
      .cookie("access_token", token, getCookieOptions())
      .status(200)
      .json({
        success: true,
        message: "Login Successful!",
        token,
        user: rest,
        rest,
      });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, username } = req.body;
  if (!email) {
    return next(errorHandler(400, "Email is required for social login"));
  }

  try {
    let user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      const generatedPassword =
        Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      user = new User({
        username:
          (username || "user").split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      });
      await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("CRITICAL: JWT_SECRET environment variable is missing!");
      return next(errorHandler(500, "Server configuration error: missing JWT_SECRET"));
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });
    const { password: pass, ...rest } = user._doc;

    res
      .cookie("access_token", token, getCookieOptions())
      .status(200)
      .json({
        success: true,
        message: "Login Successful via Google!",
        token,
        user: rest,
        rest,
      });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(errorHandler(400, "Email is required"));
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json({
      success: true,
      message: "Password reset token generated!",
      resetToken: user._id,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return next(errorHandler(400, "User ID and new password are required"));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    next(error);
  }
};
