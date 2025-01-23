const express = require("express");
const { GenerateVoiceAnswer } = require("../controllers/aiController.js");

const router = express.Router();

// router.post("/generate-voice-answer", GenerateVoiceAnswer);

const accessTracker = {}; // In-memory store for tracking access
router.post("/generate-voice-answer", (req, res) => {
  const ip = req.body.ip || req.ip
  console.log("ip => ", ip)
  const currentTime = Date.now();

  // Check if the IP address exists in the tracker
  if (!accessTracker[ip]) {
    accessTracker[ip] = { count: 1, firstAccess: currentTime };
  } else {
    // Check if the user has exceeded the allowed limit
    const { count, firstAccess } = accessTracker[ip];
    const hoursSinceFirstAccess =
      (currentTime - firstAccess) / (1000 * 60 * 60);

    if (hoursSinceFirstAccess < 24) {
      if (count < 3) {
        accessTracker[ip].count++;
      } else {
        return res
          .status(429)
          .json({ message: "Uh-oh! You've hit your response limit. 😢 But don't worry – the app will be live soon, and we’ll be able to chat then! 🚀✨Hang tight, friend! 💬💡" });
      }
    } else {
      // Reset the count after 24 hours
      accessTracker[ip] = { count: 1, firstAccess: currentTime };
    }
  }
  console.log('accessTracker :>> ', accessTracker);
  // Proceed with the GenerateVoiceAnswer logic
  GenerateVoiceAnswer(req, res);
});

module.exports = router;
