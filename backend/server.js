const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const { authMiddleware } = require("./middleware/authenticate");
const { errorHandler } = require("./middleware/errorHandler");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const queryRoute = require("./routes/queryRoute");
const missionRoute = require("./routes/missionRoute");
const { createTables } = require("./controllers/userController");

dotenv.config();

const port = process.env.PORT || 3000;
const base_url = process.env.BASE_URL;

const app = express();

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: base_url,
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your API docs
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// CORS configuration
const corsOptions = {
  origin: "*", // Allow this origin
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("combined"));
app.use(errorHandler);
// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json("Server is running correctly!");
});

// Health check function
const healthCheck = async () => {
  try {
    const response = await axios.get(`${base_url}/api/health`);
    console.log(`Health check response: ${response.data}`);
  } catch (error) {
    console.error("Health check failed:", error.message);
  }
};

// Set an interval to perform the health check every 3 minutes (180000 ms)
setInterval(healthCheck, 180000);

app.use("/api/create-tables", createTables)
app.use("/api/auth", authRoute);
app.use("/api/user", authMiddleware, userRoute);
app.use("/api/query", authMiddleware, queryRoute);
app.use("/api/mission", authMiddleware, missionRoute);

app.use("/", express.static(path.join(__dirname, "uploads")));

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

module.exports = app;
