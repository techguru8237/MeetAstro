const pool = require("../config/db.js");

const startMission = async (req, res) => {
  try {
    // Check if missionType is provided
    if (!req.body.missionType) {
      return res
        .status(400)
        .json({ error: "The type of mission has to be defined." });
    }

    // Fetch user data
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [
      req.user.id,
    ]);

    // Check if user data exists
    if (user.rows.length === 0) {
      return res.status(401).json({
        status: "failed",
        message: "Cannot find current user's data from database",
      });
    }

    // Get current time and calculate end time
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + 3 * 60000); // 3 minutes later

    // Insert new mission into the database
    const newMission = await pool.query(
      "INSERT INTO missions (user_id, start_at, end_at, mission_type) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, startAt, endAt, req.body.missionType]
    );

    // Return the updated mission
    return res.status(201).json({
      status: "success",
      mission: newMission.rows[0],
    });
  } catch (error) {
    console.log("error :>> ", error);
    return res
      .status(500)
      .json({ error: "An error occurred while starting the mission." });
  }
};

module.exports = { startMission };
