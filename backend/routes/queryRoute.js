const express = require("express");
const { GenerateVoiceAnswer } = require("../controllers/aiController.js");

const router = express.Router();

// router.post("/generate-voice-answer", GenerateVoiceAnswer);

const accessTracker = {}; // In-memory store for tracking access
router.post("/generate-voice-answer", (req, res) => {
  //   req.headers["x-forwarded-for"] ||
console.log("req ==>> ", req)
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
          .json({ message: "Uh-oh! You've hit your response limit. 😢 But don't worry – the app will be live soon, and we’ll be able to chat then! 🚀✨Hang tight, friend! 💬💡" });
      }
    } else {
      // Reset the count after 24 hours
      accessTracker[id] = { count: 1, firstAccess: currentTime };
    }
  }
  console.log('accessTracker :>> ', accessTracker);
  // Proceed with the GenerateVoiceAnswer logic
  GenerateVoiceAnswer(req, res);
});

module.exports = router;
