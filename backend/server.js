const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const axios = require('axios')
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const { authMiddleware } = require("./middleware/authenticate");
const { errorHandler } = require("./middleware/errorHandler");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const queryRoute = require("./routes/queryRoute");
const missionRoute = require("./routes/missionRoute");
const { createTables, alterTables } = require("./controllers/databaseController");
const swaggerDocument = require("./swagger/swagger.json");

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

// Swagger definition
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// Create the /check-server route
app.get("/check-server", (req, res) => {
  res.status(200).send("Server is running");
});

// Function to send request to the /check-server endpoint
const sendRequestToServer = async () => {
  try {
    await axios.get(`${base_url}/check-server`);
  } catch (error) {
    console.error("Error sending request:", error.message);
  }
};

// Set interval to send request every 3 minutes (180000 milliseconds)
setInterval(sendRequestToServer, 180000);

// routes
app.use("/api/create-tables", createTables);
app.use("/api/alter-tables", alterTables);
app.use("/api/auth", authRoute);
app.use("/api/user", authMiddleware, userRoute);
app.use("/api/query", queryRoute);
app.use("/api/mission", authMiddleware, missionRoute);

app.use("/", express.static(path.join(__dirname, "uploads")));

// Serve the index.html file for all other routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
