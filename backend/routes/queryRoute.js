const express = require("express");
const { ipAddress } = require("@vercel/functions");
const { GenerateVoiceAnswer } = require("../controllers/aiController.js");

const router = express.Router();

// router.post("/generate-voice-answer", GenerateVoiceAnswer);

const accessTracker = {}; // In-memory store for tracking access
router.post("/generate-voice-answer", (req, res) => {
  //   req.headers["x-forwarded-for"] ||

  const id = req.headers["x-vercel-id"];

  const currentTime = Date.now();

  // Check if the IP address exists in the tracker
  if (!accessTracker[id]) {
    accessTracker[id] = { count: 1, firstAccess: currentTime };
  } else {
    // Check if the user has exceeded the allowed limit
    const { count, firstAccess } = accessTracker[id];
    const hoursSinceFirstAccess =
      (currentTime - firstAccess) / (1000 * 60 * 60);

    if (hoursSinceFirstAccess < 24) {
      if (count < 3) {
        accessTracker[id].count++;
      } else {
        return res
          .status(429)
          .json({ message: "Access limit exceeded. Try again tomorrow." });
      }
    } else {
      // Reset the count after 24 hours
      accessTracker[id] = { count: 1, firstAccess: currentTime };
    }
  }

  // Proceed with the GenerateVoiceAnswer logic
  GenerateVoiceAnswer(req, res);
});

module.exports = router;
