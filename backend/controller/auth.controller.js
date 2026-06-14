import User from "../models/user.model.js";
import { errorHandler } from "../utilies/error.js"
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  const isValidUser = await User.findOne({ email });

  if (isValidUser) {
    return next(errorHandler(400, "User already exists"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const validUser = await User.findOne({ email })

    if (!validUser) {
      return next(errorHandler(404, "User not found"))
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password)

    if (!validPassword) {
      return next(errorHandler(401, "Wrong Credentials"))
    }

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET)

    const { password: pass, ...rest } = validUser._doc

    res.cookie("access_token", token, { httpOnly: true }).status(200).json({
      success: true,
      message: "Login Successful!",
      rest,
    })
  } catch (error) {
    next(error)
  }
}

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, username } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      user = new User({
        username: username.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
        email,
        password: hashedPassword,
      });
      await user.save();
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = user._doc;
    res.cookie("access_token", token, { httpOnly: true }).status(200).json({
      success: true,
      message: "Login Successful via Google!",
      rest,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json({
      success: true,
      message: "Password reset token generated!",
      resetToken: user._id
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { userId, password } = req.body;
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
