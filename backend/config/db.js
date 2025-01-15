import dotenv from 'dotenv'
import pkg from "pg";
dotenv.config()
const { Pool } = pkg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  maxUses: 7500, // Close a connection after it has been used 7500 times
});

export default pool;