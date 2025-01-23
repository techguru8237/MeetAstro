const OpenAI = require("openai");
const axios = require("axios");
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
          botResponse:
            "Uh-oh! You've hit your response limit. 😢 But don't worry - the app will be live soon, and we'll be able to chat then! 🚀✨Hang tight, friend! 💬💡",
          remaining: 0, // No remaining requests
          audioUrl: `${base_url}/rate_limit_answer.mp3`, // Adjust based on the actual response structure
          audioDuration: 8,
        });
      }
    } else {
      // Reset the count after 24 hours
      accessTracker[ip] = { count: 1, firstAccess: currentTime };
    }
  }

  const remainingRequests = MAX_REQUESTS - accessTracker[ip].count; // Calculate remaining requests

  const query = req.body.query;

  try {
    const fileContent = await getFileContent(sourceFile);

    const perplexityOptions = {
      model: "llama-3.1-sonar-huge-128k-online",
      messages: [
        { role: "system", content: "Be precise and concise." },
        { role: "user", content: query },
      ],
      temperature: 0.7,
    };

    const perplexityResponse = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      perplexityOptions,
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const newContent = `Role: You create the response for the robot of crypto project MeetAstroAI.
    Context: A user asked the robot this question: ${query}
    Relevant knowledge base: ${fileContent}, ${perplexityResponse.data.choices[0].message.content}
    Task: Form the response robot will voice out and send back to user. Make it concise and to-the-point. The response must also specify the reason using numbers and measurable metrics why the specific response is provided in form introducing it after the word 'because'.
    Requirement to the response: Not longer than 350 characters.
    Language of the response: en
    Mood of the response: fun, light-hearted, cute, clumsy, intelligent.
    Return nothing but the text of the response.`;

    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: newContent,
        },
      ],
      max_completion_tokens: 2048,
    });

    const shortenOpenAIResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Shorten this response to post on X: ${openAIResponse.choices[0].message.content}`,
        },
      ]
    });

    const minimizedOpenAIResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Clean up this response from all emojis, hashtags and other symbols to be eligible for voicing out: ${shortenOpenAIResponse.choices[0].message.content}`,
        },
      ],
    });

    const botResponse = minimizedOpenAIResponse.choices[0].message.content;

    const { fileName, duration } = await createAudioFileFromText(botResponse);

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
