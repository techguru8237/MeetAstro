const express = require("express");
const { GenerateVoiceAnswer } = require("../controllers/aiController.js");
const validate = require("../middleware/validate.js");

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
router.post("/generate-voice-answer", validate, GenerateVoiceAnswer);

module.exports = router;
