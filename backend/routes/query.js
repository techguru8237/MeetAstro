import express from "express";
import { GenerateVoiceAnswer } from "../controllers/aiController.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// generate voice answer route -- POST request
router.post("/generate-voice-answer", validate, GenerateVoiceAnswer);

export default router;
