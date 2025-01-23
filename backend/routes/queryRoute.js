const express = require("express");
const { GenerateVoiceAnswer } = require("../controllers/aiController.js");

const router = express.Router();

router.post("/generate-voice-answer", GenerateVoiceAnswer);

module.exports = router;
