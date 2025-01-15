import pool from "./db.js"; // Assuming you have your pool set up

const createUserTable = async () => {
  const query = `
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(25),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role INTEGER CHECK (role >= 0 AND role <= 10) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Users table created successfully.");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

export default createUserTable
