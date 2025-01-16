const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const verifyToken = promisify(jwt.verify);

const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from the headers
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token

    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "Access denied. No token provided.",
      });
    }

    // Verify the token
    const decoded = await verifyToken(token, process.env.JWT_SECRET); // Ensure you have a JWT_SECRET in your .env file

    // Attach user information to the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({
      status: "failed",
      message: "Invalid token.",
    });
  }
};

module.exports = { authMiddleware };
