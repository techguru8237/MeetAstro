import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";
import User from "../models/User.js";
import axios from "axios";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto"; // Import crypto for generating tokens
dotenv.config();

const frontend_url = process.env.FRONTEND_URL;

/**
 * Generates a JWT token for a user.
 * @param {string} id - The user's ID.
 * @returns {string} The signed JWT token.
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TIMEOUT,
  });
};

// Configure your email transport
const transporter = nodemailer.createTransport({
  service: "gmail", // or another email service
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

/**
 * Authenticates a user via Google OAuth.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function GoogleAuth(req, res) {
  try {
    const access_token = req.query.access_token;

    // Fetch user information from Google
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );

    // Check if the user exists in the database
    let user = await User.findOne({ email: userRes.data.email });

    // If user does not exist, create a new user
    if (!user) {
      user = await User.create({
        name: userRes.data.name,
        email: userRes.data.email,
        image: userRes.data.picture,
      });
    }

    // Sign a token for the user
    const token = signToken(user._id);

    const cookieOptions = {
      expires: new Date(Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production", // Set secure cookie in production
    };

    user.password = undefined; // Remove password from user object

    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({
      message: "success",
      token,
      data: { user },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
}

/**
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function Register(req, res) {
  const { email, password } = req.body; // Destructure email and password from request body
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "failed",
        data: [],
        message: "It seems you already have an account, please log in instead.",
      });
    }

    // Create and save new user
    const newUser = new User({ email, password });
    const savedUser = await newUser.save();
    const { role, ...user_data } = savedUser._doc;

    res.status(200).json({
      status: "success",
      data: [user_data],
      message:
        "Thank you for registering with us. Your account has been successfully created.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
}

/**
 * Logs in a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function Login(req, res) {
  const { email, password } = req.body; // Destructure email and password from request body
  try {
    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        status: "failed",
        data: [],
        message:
          "Invalid email or password. Please try again with the correct credentials.",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "failed",
        data: [],
        message:
          "Invalid email or password. Please try again with the correct credentials.",
      });
    }

    // Sign a token for the user
    const token = signToken(user._id);
    const { password: _, ...user_data } = user._doc;

    res.status(200).json({
      status: "success",
      token,
      data: [user_data],
      message: "You have successfully logged in.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
}

/**
 * Logs out a user by blacklisting the JWT token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function Logout(req, res) {
  try {
    const authHeader = req.headers["cookie"]; // Get the session cookie from request header
    if (!authHeader) return res.sendStatus(204); // No content

    const cookie = authHeader.split("=")[1]; // Extract the JWT token from cookie
    const accessToken = cookie.split(";")[0];

    // Check if the token is already blacklisted
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
    if (checkIfBlacklisted) return res.sendStatus(204); // No content

    // Blacklist the token
    const newBlacklist = new Blacklist({ token: accessToken });
    await newBlacklist.save();

    // Clear request cookie on client
    res.setHeader("Clear-Site-Data", '"cookies"');
    res.status(200).json({ message: "You are logged out!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

/**
 * Sends a password reset link to the user's email.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function ForgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).send("User not found");

    // Generate a password reset token
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with the reset link
    const resetUrl = `http://${frontend_url}/auth/reset-password/${token}`;
    await transporter.sendMail({
      from: '"Meet Astro Team" <bentan010918@gmail.com>', // Correct format
      to: email,
      subject: "Password Reset",
      html: `Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.send("Password reset link sent to your email");
  } catch (error) {
    console.error("Error sending email:", error.message); // Improved error logging
    res.status(500).send("Internal Server Error");
  }
}


/**
 * Resets the user's password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function ResetPassword(req, res) {
  try {
    const { token, password } = req.body;

    // Find user by reset token and check if it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send("Invalid or expired token");

    // Update the user's password (ensure to hash it)
    user.password = await bcrypt.hash(password, 10); // Hash the new password
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the expiration
    await user.save();

    res.send("Password has been reset");
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).send("Internal Server Error");
  }
}
