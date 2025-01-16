const express = require("express");
const validate = require("../middleware/validate.js");
const { check } = require("express-validator");
const {
  Register,
  Login,
  GoogleAuth,
  ForgotPassword,
  ResetPassword,
} = require("../controllers/authController.js");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal Server Error
 */

// Register route -- POST request
router.post(
  "/register",
  check("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  check("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Must be at least 8 chars long"),
  validate,
  Register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal Server Error
 */

router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  check("password").not().isEmpty(),
  validate,
  Login
);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Authenticate user via Google OAuth
 *     parameters:
 *       - name: access_token
 *         in: query
 *         required: true
 *         description: The access token obtained from Google OAuth.
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         image:
 *                           type: string
 *       500:
 *         description: Internal Server Error
 */
router.get("/google", GoogleAuth);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send password reset link to user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user requesting a password reset.
 *     responses:
 *       200:
 *         description: Password reset link sent
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/forgot-password", ForgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset user's password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The password reset token received in the email.
 *               password:
 *                 type: string
 *                 description: The new password for the user.
 *     responses:
 *       200:
 *         description: Password has been reset
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal Server Error
 */
router.post("/reset-password", ResetPassword);

module.exports = router;
