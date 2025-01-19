const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const YAML = require("yamljs");
const { authMiddleware } = require("./middleware/authenticate");
const { errorHandler } = require("./middleware/errorHandler");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const queryRoute = require("./routes/queryRoute");
const missionRoute = require("./routes/missionRoute");
const { createTables } = require("./controllers/userController");

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation using Swagger",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to your API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("combined"));
app.use(
  cors({
    origin: "*", // Allow this origin
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(errorHandler);

// routes
app.use("/api/create-tables", createTables);
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
