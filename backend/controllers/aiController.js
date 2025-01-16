import OpenAI from "openai";
import { ElevenLabsClient } from "elevenlabs";
import fs, { createWriteStream } from "fs";
import { fileURLToPath } from "url";
import path from 'path'
import dotenv from "dotenv";
dotenv.config();

const base_url = process.env.BASE_URL;

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceFile = path.join(__dirname, "../data/AstroBaseInformation.txt");

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define your Eleven Labs API endpoint and key
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;

const client = new ElevenLabsClient({
  apiKey: ELEVEN_LABS_API_KEY,
});

// Function to read file content
async function getFileContent(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const createAudioFileFromText = async (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audio = await client.generate({
        voice: "Liam",
        model_id: "eleven_turbo_v2_5",
        text,
      });
      const fileName = `public/Answer_${Date.now()}.mp3`; // Save to public folder
      const fileStream = createWriteStream(fileName);

      audio.pipe(fileStream);
      fileStream.on("finish", () => resolve(fileName)); // Resolve with the fileName
      fileStream.on("error", reject);

      return fileName;
    } catch (error) {
      reject(error);
    }
  });
};

export async function GenerateVoiceAnswer(req, res) {
  const customerQuery = req.body.query;
  try {
    const fileContent = await getFileContent(sourceFile);
    // Step 1: Send the customer's query to OpenAI
    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: fileContent },
        { role: "system", content: "Answer the questions based on above content also" },
        { role: "user", content: customerQuery },
      ],
    });

    const botResponse = openAIResponse.choices[0].message.content;

    const fileName = await createAudioFileFromText(botResponse);
    console.log('fileName :>> ', fileName);

    // Step 3: Send the audio result back to the frontend
    res.json({
      botResponse,
      audioUrl: `${base_url}/${fileName.replace("public/", "")}`, // Adjust based on the actual response structure
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
}
