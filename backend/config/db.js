// config/db.js
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Set to true if you want to enforce SSL certificate validation
  },
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log("Connected to NeonDB PostgreSQL database");
  } catch (err) {
    console.error("Database connection error:", err.stack);
  }
};

export default connectDB;






// config/db.js
// import { Pool } from 'pg';

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// const connectDB = async () => {
//   try {
//     await pool.connect();
//     console.log("Connected to PostgreSQL database");
//   } catch (err) {
//     console.error("Database connection error:", err.stack);
//   }
// };

// export default connectDB;
