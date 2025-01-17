const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const axios = require("axios");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // Import crypto for generating tokens
require("dotenv").config();

const pool = require("../config/db.js");
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
async function GoogleAuth(req, res) {
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
async function Register(req, res) {
  const { email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        status: "failed",
        message: "It seems you already have an account, please log in instead.",
      });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    const { password: _, ...user_data } = newUser.rows[0];

    res.status(200).json({
      status: "success",
      data: [user_data],
      message:
        "Thank you for registering with us. Your account has been successfully created.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

/**
 * Logs in a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function Login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({
        status: "failed",
        message:
          "Invalid email or password. Please try again with the correct credentials.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "failed",
        message:
          "Invalid email or password. Please try again with the correct credentials.",
      });
    }

    const token = jwt.sign(user.rows[0], process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TIMEOUT,
    });
    const { password: _, ...user_data } = user.rows[0];

    res.status(200).json({
      status: "success",
      token,
      data: [user_data],
      message: "You have successfully logged in.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

/**
 * Logs out a user by blacklisting the JWT token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function Logout(req, res) {
  try {
    const authHeader = req.headers["cookie"];
    if (!authHeader) return res.sendStatus(204);

    const cookie = authHeader.split("=")[1];
    const accessToken = cookie.split(";")[0];

    // Blacklist the token
    await pool.query("INSERT INTO blacklist (token) VALUES ($1)", [
      accessToken,
    ]);

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
async function ForgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Query to find the user by email
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0]; // Access the first row

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Generate a password reset token
    const token = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    // Update the user with the reset token and expiration
    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [token, resetPasswordExpires, user.id]
    );

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
async function ResetPassword(req, res) {
  try {
    const { token, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
      [token]
    );

    if (user.rows.length === 0)
      return res.status(400).send("Invalid or expired token");

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [hashedPassword, user.rows[0].id]
    );

    res.send("Password has been reset");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

// Exporting the functions for use in other modules
module.exports = {
  GoogleAuth,
  Register,
  Login,
  Logout,
  ForgotPassword,
  ResetPassword,
};
