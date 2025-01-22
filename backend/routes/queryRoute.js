const express = require("express");
const { GenerateVoiceAnswer } = require("../controllers/aiController.js");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Query
 *   description: AI processing routes
 */

/**
 * @swagger
 * /api/query/generate-voice-answer:
 *   post:
 *     tags: [Query]
 *     summary: Generate voice answer
 *     description: Generates a voice answer based on the user's query.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: "What is your name?"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 botResponse:
 *                   type: string
 *                   example: "You can call me AI Astro, your personal 3D AI avatar! I bring together AI, gaming, entertainment, and decentralized finance (DeFi) into one awesome experience."
 *                 audioUrl:
 *                   type: string
 *                   example: "https://meetastro.onrender.com/Answer_1736973948673.mp3"
 *                 audioDuration:
 *                   type: string
 *                   example: 12.772
 *       500:
 *         description: Error occurred
 */
// router.post("/generate-voice-answer", validate, GenerateVoiceAnswer);
const accessTracker = {}; // In-memory store for tracking access
router.post("/generate-voice-answer", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.ip;
  console.log("accessTracker :>> ", accessTracker);
  console.log("ip :>> ", ip);

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
          .json({ message: "Access limit exceeded. Try again tomorrow." });
      }
    } else {
      // Reset the count after 24 hours
      accessTracker[ip] = { count: 1, firstAccess: currentTime };
    }
  }

  // Proceed with the GenerateVoiceAnswer logic
  GenerateVoiceAnswer(req, res);
});

module.exports = router;
