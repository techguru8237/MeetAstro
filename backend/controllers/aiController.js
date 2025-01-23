const OpenAI = require("openai");
const { ElevenLabsClient } = require("elevenlabs");
const fs = require("fs");
const { createWriteStream } = require("fs");
const { promisify } = require("util");
const musicMetadata = require("music-metadata"); // Install this package
const mp3Duration = require("mp3-duration"); // Alternatively, you can use this package
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const base_url = process.env.BASE_URL;

const sourceFile = path.join(__dirname, "../data/AstroBaseInformation.txt");

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define your Eleven Labs API endpoint and key
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const VOICE_ID = process.env.VOICE_ID;

const client = new ElevenLabsClient({ apiKey: ELEVEN_LABS_API_KEY });

// Function to read file content
const getFileContent = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const createAudioFileFromText = async (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audio = await client.textToSpeech.convert(VOICE_ID, {
        output_format: "mp3_44100_128",
        text: text,
        model_id: "eleven_multilingual_v2",
      });

      const fileName = `uploads/Answer_${Date.now()}.mp3`; // Save to public folder
      const fileStream = createWriteStream(fileName);
      audio.pipe(fileStream);

      fileStream.on("finish", async () => {
        try {
          // Get the duration of the MP3 file
          const duration = await promisify(mp3Duration)(fileName);
          resolve({ fileName, duration }); // Resolve with an object containing fileName and duration
        } catch (error) {
          reject(error);
        }
      });

      fileStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

const accessTracker = {}; // In-memory store for tracking access

const MAX_REQUESTS = 3; // Maximum allowed requests in 24 hours

const GenerateVoiceAnswer = async (req, res) => {
  // Check if req.body.query is not empty
  if (!req.body.query || req.body.query.trim() === "") {
    return res.status(400).json({ error: "Query cannot be empty." });
  }

  const ip = req.body.ip;

  if (!ip) {
    return res.status(400).json({ error: "IP address needed." });
  }

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
      if (count < MAX_REQUESTS) {
        accessTracker[ip].count++;
      } else {
        return res.status(429).json({
          message:
            "Uh-oh! You've hit your response limit. 😢 But don't worry - the app will be live soon, and we'll be able to chat then! 🚀✨Hang tight, friend! 💬💡",
          remaining: 0, // No remaining requests
        });
      }
    } else {
      // Reset the count after 24 hours
      accessTracker[ip] = { count: 1, firstAccess: currentTime };
    }
  }

  const remainingRequests = MAX_REQUESTS - accessTracker[ip].count; // Calculate remaining requests

  console.log("accessTracker :>> ", accessTracker);

  const query = req.body.query;

  try {
    const fileContent = await getFileContent(sourceFile);

    // Step 1: Send the customer's query to OpenAI
    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: fileContent },
        { role: "system", content: "Don't exceed 25 words" },
        { role: "user", content: query },
      ],
    });

    const botResponse = openAIResponse.choices[0].message.content;

    const { fileName, duration } = await createAudioFileFromText(botResponse);

    // Step 3: Send the audio result back to the frontend
    res.status(200).json({
      botResponse,
      audioUrl: `${base_url}/${fileName.replace("uploads/", "")}`, // Adjust based on the actual response structure
      audioDuration: duration,
      remaining: remainingRequests, // Return remaining requests
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};

module.exports = { GenerateVoiceAnswer };
