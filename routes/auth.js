import express from "express";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import {
  Register,
  Login,
  GoogleAuth,
  ForgotPassword,
  ResetPassword,
} from "../controllers/auth.js";

const router = express.Router();

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
  Validate,
  Register
);

router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  check("password").not().isEmpty(),
  Validate,
  Login
);

router.get("/google", GoogleAuth);

router.post("/forgot-password", ForgotPassword);

router.post("/reset-password", ResetPassword);

export default router;
