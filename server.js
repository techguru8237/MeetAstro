import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

import authRoute from "./routes/auth.js";
import connectDB from "./config/db.js";
import swaggerDocument from './swagger/swagger.js'

// Database connection
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    swaggerDefinition: swaggerDocument,
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Allow this origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));

app.use("/api/auth", authRoute);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json("Server is running correctly!");
});

// Serve static files from the uploads directory
// app.use("/", express.static(path.join(__dirname, "uploads")));

// Serve the index.html file for all other routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
