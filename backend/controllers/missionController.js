const pool = require("../config/db.js");
const moment = require("moment-timezone");
const levelStandard = require('../data/level.json')
const chestOneRewards = require("../data/chest1.json");
const chestTwoRewards = require("../data/chest2.json");
const chestThreeRewards = require("../data/chest3.json");

const getRandomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getChestInfo = (missionType) => {
  let chestNumber = 0;
  let duration = 0;
  let credit = 0;

  const randomValue = Math.random();

  if (missionType === 1) {
    if (randomValue <= 0.8) {
      chestNumber = 1;
    } else if (randomValue > 0.8 && randomValue <= 0.95) {
      chestNumber = 2;
    } else chestNumber = 3;
    duration = 3;
    credit = 10;
  } else if (missionType === 2) {
    if (randomValue <= 0.7) {
      chestNumber = 2;
    } else if (randomValue > 0.7 && randomValue <= 0.85) {
      chestNumber = 1;
    } else chestNumber = 1;
    duration = 8;
    credit = 30;
  } else {
    if (randomValue <= 0.8) {
      chestNumber = 3;
    } else if (randomValue > 0.8 && randomValue <= 0.95) {
      chestNumber = 2;
    } else chestNumber = 1;
    duration = 12;
    credit = 50;
  }

  return { chestNumber, duration, credit };
};

const getRewards = (user, mission) => {
  try {
    let rewardsList = {};
    const chestNumber = mission.chest_number;

    if (chestNumber === 1) {
      rewardsList = chestOneRewards;
    } else if (chestNumber === 2) {
      rewardsList = chestTwoRewards;
    } else rewardsList = chestThreeRewards;

    const userCredit = user.credit || 0;

    const rewardInfo = rewardsList.find(
      (item) => userCredit >= item.min_credit && userCredit < item.max_credit
    );

    let diamond = 0;
    const gold = getRandomBetween(rewardInfo.min_gold, rewardInfo.max_gold);
    if (Math.random() < 0.05) {
      diamond = getRandomBetween(2, 4);
    }

    return {
      credit: mission.credit,
      gold,
      xp: rewardInfo.experience_point,
      diamond,
    };
  } catch (error) {}
};

const getMissions = async (req, res) => {
  try {
    const localTime = moment.tz("Asia/Tokyo").format(); // Get current time in Tokyo

    const missions = await pool.query(
      "SELECT * FROM missions WHERE user_id = $1 AND able_to_open_chest_at > $2",
      [req.user.id, localTime]
    );

    // Check if missions exist
    if (missions.rowCount === 0) {
      return res.status(404).json({ message: "No missions found." });
    }

    res.status(200).json(missions.rows);
  } catch (error) {
    console.error("Error fetching missions: ", error);
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving missions." });
  }
};

const startMission = async (req, res) => {
  try {
    const localTime = moment.tz("Asia/Tokyo").format(); // Get current time in Tokyo

    const openedMission = await pool.query(
      "SELECT * FROM missions WHERE user_id = $1 AND end_at > $2",
      [req.user.id, localTime]
    );
    if (openedMission.rows.length > 0) {
      return res.status(400).json({
        message:
          "There is an opened mission. Please try again after Astro returns.",
      });
    }

    const missionType = parseInt(req.body.missionType);
    // Check if missionType is provided
    if (!missionType) {
      return res
        .status(400)
        .json({ message: "The type of mission has to be defined." });
    } else if (missionType > 3) {
      return res
        .status(400)
        .json({ message: "The type of mission has to be less than 4" });
    }

    // Fetch user data
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [
      req.user.id,
    ]);

    // Check if user data exists
    if (user.rows.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "Cannot find current user's data from database",
      });
    }

    const startAt = new Date(); // This is in local time
    const endAt = new Date(startAt.getTime() + 3 * 60000); // 3 minutes later

    const isGetChest = Math.random() < 1; // Ensure you're accessing the correct user data

    if (isGetChest) {
      const { chestNumber, duration, credit } = getChestInfo(missionType);

      const ableToChestOpenAt = new Date(
        endAt.getTime() + duration * 3600 * 1000 // Duration in hours
      );

      const openedChest = false;

      // Insert new mission into the database
      const newMission = await pool.query(
        "INSERT INTO missions (user_id, start_at, end_at, mission_type, chest_number, able_to_open_chest_at, opened_chest, credit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          req.user.id,
          startAt,
          endAt,
          missionType,
          chestNumber,
          ableToChestOpenAt,
          openedChest,
          credit,
        ]
      );

      return res.status(201).json({
        status: "success",
        mission: newMission.rows[0],
      });
    } else {
      // Insert new mission into the database
      const newMission = await pool.query(
        "INSERT INTO missions (user_id, start_at, end_at, mission_type, chest_number) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [req.user.id, startAt, endAt, missionType, chestNumber]
      );

      return res.status(201).json({
        status: "success",
        mission: newMission.rows[0],
      });
    }
  } catch (error) {
    console.log("error :>> ", error);
    return res
      .status(500)
      .json({ error: "An error occurred while starting the mission." });
  }
};

const openChest = async (req, res) => {
  try {
    const missionResult = await pool.query(
      "SELECT * FROM missions WHERE id = $1",
      [req.body.missionId]
    );

    if (missionResult.rowCount === 0) {
      return res.status(404).json({ error: "Mission not found" });
    }

    const mission = missionResult.rows[0];

    // Check if the chest can be opened based on the timestamp
    if (
      mission.able_to_open_chest_at &&
      new Date(mission.able_to_open_chest_at) > new Date() // Compare with current time in UTC
    ) {
      return res.status(400).json({
        error: `You can't open this now. You can open it at ${mission.able_to_open_chest_at}`,
      });
    }

    if (mission.opened_chest) {
      return res
        .status(400)
        .json({ error: "You have already opened this chest" });
    }

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Get rewards based on user and mission
    const { credit, gold, xp, diamond } = getRewards(user, mission);
    const currentLevelInfo = levelStandard.find(
      (item) => item.level === user.level
    );

    // Calculate new XP
    const newXP = user.xp + xp;
    let increasedLevel = 0;

    // Check if the user has leveled up
    if (newXP >= currentLevelInfo.total_xp) {
      const nextLevelInfo = levelStandard.find(
        (item, index) =>
          newXP > item.total_xp &&
          (index + 1 < levelStandard.length
            ? newXP < levelStandard[index + 1].total_xp
            : true)
      );

      if (nextLevelInfo) {
        increasedLevel = nextLevelInfo.level - user.level; // Calculate level increase
      }
    }

    // Update user's info
    const updatedUser = await pool.query(
      "UPDATE users SET credit = credit + $1, gold = gold + $2, xp = $3, diamond = diamond + $4, level = $5 WHERE id = $6 RETURNING *",
      [credit, gold, newXP, diamond, user.level + increasedLevel, user.id]
    );

    // Update the mission and return the updated row
    const updatedMission = await pool.query(
      "UPDATE missions SET credit = credit + $1, gold = gold + $2, xp = xp + $3, diamond = diamond + $4, opened_chest = $5 WHERE id = $6 RETURNING *",
      [credit, gold, xp, diamond, true, mission.id]
    );

    res.status(200).json({
      user: updatedUser.rows[0],
      mission: updatedMission.rows[0],
      levelIncreased: increasedLevel > 0, // Return whether the level has increased
      newLevel: user.level + increasedLevel, // Return the new level
    });
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const openChestByDiamond = async (req, res) => {
  try {
    const { missionId, diamondAmount } = req.body;

    // Fetch the mission based on the provided ID
    const missionResult = await pool.query(
      "SELECT * FROM missions WHERE id = $1",
      [missionId]
    );

    // Check if the mission exists
    if (missionResult.rowCount === 0) {
      return res.status(404).json({ error: "Mission not found" });
    }

    const mission = missionResult.rows[0];

    // Check if the chest has already been opened
    if (mission.opened_chest) {
      return res
        .status(400)
        .json({ error: "You have already opened this chest" });
    }

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    // Check if user exists
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Get rewards based on user and mission
    const { credit, gold, xp, diamond } = getRewards(user, mission);

    // Check if the user has enough diamonds
    if (user.diamond < diamondAmount) {
      return res
        .status(400)
        .json({ error: "You need more diamonds to open this chest." });
    }

    // Update user's info
    const updatedUser = await pool.query(
      "UPDATE users SET credit = credit + $1, gold = gold + $2, xp = xp + $3, diamond = diamond - $4 WHERE id = $5 RETURNING *",
      [credit, gold, xp, diamondAmount, user.id]
    );

    // Update the mission and return the updated row
    const updatedMission = await pool.query(
      "UPDATE missions SET credit = credit + $1, gold = gold + $2, xp = xp + $3, diamond = diamond + $4, diamond_to_open = diamond_to_open + $5, opened_at = $6, opened_chest = $7 WHERE id = $8 RETURNING *",
      [credit, gold, xp, diamond, diamondAmount, new Date(), true, mission.id]
    );

    // Respond with the updated mission and user
    return res.status(200).json({
      user: updatedUser.rows[0],
      mission: updatedMission.rows[0],
    });
  } catch (error) {
    console.error("Error opening chest by diamond: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getMissions, startMission, openChest, openChestByDiamond };
