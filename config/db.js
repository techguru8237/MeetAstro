// src/config/index.js
import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

mongoose.set("debug", true);

export default connectDB
