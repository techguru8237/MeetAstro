const pool = require("../config/db.js");
const moment = require("moment-timezone");
const levelStandard = require("../data/level.json");
const chestOneRewards = require("../data/chest1.json");
const chestTwoRewards = require("../data/chest2.json");
const chestThreeRewards = require("../data/chest3.json");
const levelForMissionList = require("../data/levelForChest.json");

/**
 * Generates a random integer between the specified minimum and maximum values.
 *
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} A random integer between min and max.
 */
const getRandomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Retrieves information about a chest based on the mission type.
 *
 * @param {number} missionType - The type of mission (1, 2, or other).
 *   - 1: Basic mission with lower rewards.
 *   - 2: Intermediate mission with moderate rewards.
 *   - Other: Advanced mission with higher rewards.
 *
 * @returns {Object} An object containing:
 *   - chestNumber: The number of chests awarded.
 *   - duration: The duration of the mission in hours.
 *   - credit: The credit earned from the mission.
 */

/**
 * Retrieves information about a chest based on the mission type.
 *
 * @param {number} missionType - The type of mission (1, 2, or other).
 *   - 1: Basic mission with lower rewards.
 *   - 2: Intermediate mission with moderate rewards.
 *   - Other: Advanced mission with higher rewards.
 *
 * @returns {Object} An object containing:
 *   - chestNumber: The number of chests awarded.
 *   - duration: The duration of the mission in hours.
 *   - credit: The credit earned from the mission.
 */
const getChestInfo = (missionType) => {
  let chestNumber = 0; // Number of chests to be awarded
  let duration = 0; // Duration of the mission
  let credit = 0; // Credit earned from the mission

  // Generate a random value between 0 and 1
  const randomValue = Math.random();

  // Determine chest information based on the mission type
  if (missionType === 1) {
    // For mission type 1
    if (randomValue <= 0.8) {
      chestNumber = 1; // 80% chance to get 1 chest
    } else if (randomValue <= 0.95) {
      chestNumber = 2; // 15% chance to get 2 chests
    } else {
      chestNumber = 3; // 5% chance to get 3 chests
    }
    duration = 3; // Duration is 3 hours
    credit = 10; // Credit earned is 10
  } else if (missionType === 2) {
    // For mission type 2
    if (randomValue <= 0.7) {
      chestNumber = 2; // 70% chance to get 2 chests
    } else if (randomValue <= 0.85) {
      chestNumber = 1; // 15% chance to get 1 chest
    } else {
      chestNumber = 1; // 15% chance to get 1 chest (redundant condition)
    }
    duration = 8; // Duration is 8 hours
    credit = 30; // Credit earned is 30
  } else {
    // For any other mission type
    if (randomValue <= 0.8) {
      chestNumber = 3; // 80% chance to get 3 chests
    } else if (randomValue <= 0.95) {
      chestNumber = 2; // 15% chance to get 2 chests
    } else {
      chestNumber = 1; // 5% chance to get 1 chest
    }
    duration = 12; // Duration is 12 hours
    credit = 50; // Credit earned is 50
  }

  // Return the chest information as an object
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

const getCurrentMissions = async (req, res) => {
  try {
    // Get the user's local timezone
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get current time in the user's local timezone
    const localTime = moment.tz(localTimezone).format();

    // Query to fetch missions that the user can open based on the current time
    const missions = await pool.query(
      "SELECT * FROM missions WHERE user_id = $1 AND able_to_open_chest_at > $2 and chest_number > $3",
      [req.user.id, localTime, 0]
    );

    console.log("missions.rows :>> ", missions.rows);

    // Check if missions exist
    if (missions.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "There is no missions that has unopened chest." });
    }

    // Return the list of missions
    res.status(200).json(missions.rows);
  } catch (error) {
    console.error("Error fetching missions: ", error); // Log the error for debugging
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving missions." });
  }
};

/**
 * @function startMission
 * @description Initiates a new mission for the authenticated user.
 * This function checks if the user has an active mission, validates the mission type,
 * and inserts a new mission record into the database.
 *
 * @param {Object} req - The request object containing user information and mission parameters.
 * @param {Object} res - The response object used to send responses back to the client.
 *
 * @returns {Object} - The newly created mission object or an error message.
 */
const startMission = async (req, res) => {
  try {
    // Get the user's local timezone
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get current time in the user's local timezone
    const localTime = moment.tz(localTimezone).format();

    // Check for any active missions for the user
    const openedMission = await pool.query(
      "SELECT * FROM missions WHERE user_id = $1 AND end_at > $2",
      [req.user.id, localTime]
    );

    // If there is an active mission, return an error
    if (openedMission.rows.length > 0) {
      return res.status(400).json({
        error:
          "There is an opened mission. Please try again after Astro returns.",
      });
    }

    // Validate missionType
    const missionType = parseInt(req.body.missionType);
    if (!missionType) {
      return res
        .status(400)
        .json({ error: "The type of mission has to be defined." });
    } else if (missionType > 3) {
      return res
        .status(400)
        .json({ error: "The type of mission has to be less than 4." });
    }

    // Fetch user data
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    // Check if user data exists
    if (user.rows.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "Cannot find current user's data from database.",
      });
    }

    // Check if the user meets the required level for the mission type
    const requiredLevel = levelForMissionList.find(
      (item) => item.missionType == missionType
    );

    if (user.rows[0].level < requiredLevel.min_level) {
      return res.status(400).json({
        status: "failed",
        message: `You can try this mission after reaching level ${requiredLevel.min_level}.`,
      });
    }

    // Set mission start and end times
    const startAt = new Date(); // This is in local time
    const endAt = new Date(startAt.getTime() + 3 * 60000); // 3 minutes later

    // Determine if the user can open a chest based on their wind chance
    const isGetChest = Math.random() < user.rows[0].winchance / 100;

    // Prepare mission data
    if (isGetChest) {
      const { chestNumber, duration, credit } = getChestInfo(missionType);
      const ableToChestOpenAt = new Date(
        endAt.getTime() + duration * 3600 * 1000
      ); // Duration in hours

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
          false, // openedChest
          credit,
        ]
      );

      return res.status(201).json({
        status: "success",
        mission: newMission.rows[0],
      });
    } else {
      // Insert new mission without chest info
      const newMission = await pool.query(
        "INSERT INTO missions (user_id, start_at, end_at, mission_type, chest_number) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [req.user.id, startAt, endAt, missionType, 0]
      );

      return res.status(201).json({
        status: "success",
        mission: newMission.rows[0],
      });
    }
  } catch (error) {
    console.log("error :>> ", error); // Log the error for debugging
    return res
      .status(500)
      .json({ error: "An error occurred while starting the mission." });
  }
};

/**
 * @function bringBackAstro
 * @description Ends a mission early by updating its end time to the current time.
 * This function checks if a valid mission ID is provided, verifies the existence of the mission,
 * and then updates the mission's end time in the database.
 *
 * @param {Object} req - The request object containing the mission ID.
 * @param {Object} res - The response object used to send responses back to the client.
 *
 * @returns {Object} - The updated mission object or an error message.
 */
const bringBackAstro = async (req, res) => {
  try {
    // Parse and validate the mission ID from the request body
    const missionId = parseInt(req.body.missionId);

    if (!missionId) {
      return res.status(400).json({ error: "missionId needed." });
    }

    // Check if the mission exists in the database
    const missionResult = await pool.query(
      "SELECT * FROM missions WHERE id = $1",
      [missionId]
    );

    if (missionResult.rowCount === 0) {
      return res.status(404).json({ error: "Mission not found" });
    }

    // Update the mission's end time to the current time
    const updatedMission = await pool.query(
      "UPDATE missions SET end_at = NOW() WHERE id = $1 RETURNING *",
      [missionId]
    );

    // Log the updated mission for debugging
    console.log("updatedMission :>> ", updatedMission);

    // Return the updated mission details
    res.status(200).json(updatedMission.rows[0]);
  } catch (error) {
    console.error("Error bringing back Astro: ", error); // Log the error for debugging
    return res
      .status(500)
      .json({ error: "An error occurred while bringing back Astro." });
  }
};

/**
 * Opens a chest for a user based on the mission ID.
 *
 * @param {Object} req - The request object containing missionId in the body.
 * @param {Object} res - The response object.
 * @returns {Object} - Returns user and mission details along with rewards.
 */
const openChest = async (req, res) => {
  try {
    // Query to find the mission by its ID
    const missionResult = await pool.query(
      "SELECT * FROM missions WHERE id = $1",
      [req.body.missionId]
    );

    // Check if the mission exists
    if (missionResult.rowCount === 0) {
      return res.status(404).json({ error: "Mission not found" });
    }

    const mission = missionResult.rows[0];

    // Check if there is a chest to open
    if (mission.chest_number == 0) {
      return res.status(400).json({ error: "There is no chest" });
    }

    // Check if the chest can be opened based on the timestamp
    if (
      mission.able_to_open_chest_at &&
      new Date(mission.able_to_open_chest_at) > new Date() // Compare with current time in UTC
    ) {
      return res.status(400).json({
        error: `You can't open this now. You can open it at ${mission.able_to_open_chest_at}`,
      });
    }

    // Check if the chest has already been opened
    if (mission.opened_chest) {
      return res
        .status(400)
        .json({ error: "You have already opened this chest" });
    }

    // Query to find the user by their ID
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    // Check if the user exists
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Get rewards based on user and mission
    const { credit, gold, xp, diamond } = getRewards(user, mission);

    // Get current level information
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

    // Update user's information in the database
    const updatedUser = await pool.query(
      "UPDATE users SET credit = credit + $1, gold = gold + $2, xp = $3, diamond = diamond + $4, level = $5 WHERE id = $6 RETURNING *",
      [credit, gold, newXP, diamond, user.level + increasedLevel, user.id]
    );

    // Update the mission details in the database
    const updatedMission = await pool.query(
      "UPDATE missions SET credit = credit + $1, gold = gold + $2, xp = xp + $3, diamond = diamond + $4, opened_chest = $5 WHERE id = $6 RETURNING *",
      [credit, gold, xp, diamond, true, mission.id]
    );

    // Send response with updated user and mission details
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

/**
 * Opens a chest for a user based on the mission ID and diamond amount.
 *
 * @param {Object} req - The request object containing missionId and diamondAmount in the body.
 * @param {Object} res - The response object.
 * @returns {Object} - Returns user and mission details along with rewards.
 */
const openChestByDiamond = async (req, res) => {
  try {
    const missionId = parseInt(req.body.missionId); // Parse missionId from request body
    const diamondAmount = parseInt(req.body.diamondAmount); // Parse diamondAmount from request body

    // Validate input parameters
    if (!missionId || !diamondAmount) {
      return res
        .status(400)
        .json({ error: "missionId and diamondAmount must be included." });
    }

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

    // Check if there is a chest to open
    if (mission.chest_number == 0) {
      return res.status(400).json({ error: "There is no chest" });
    }

    // Check if the chest has already been opened
    if (mission.opened_chest) {
      return res
        .status(400)
        .json({ error: "You have already opened this chest" });
    }

    // Calculate required diamonds based on the time until the chest can be opened
    const requiredDiamonds =
      Math.floor(
        (new Date(mission.able_to_open_chest_at) - new Date()) / (1000 * 3600)
      ) * 6;

    // Validate diamond amount
    if (diamondAmount < requiredDiamonds) {
      return res.status(400).json({
        error: `You need ${requiredDiamonds} diamonds to open the chest now.`,
      });
    }

    // Fetch user information
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    // Check if user exists
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Check if the user has enough diamonds
    if (user.diamond < diamondAmount) {
      return res
        .status(400)
        .json({ error: "You need more diamonds to open this chest." });
    }

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

    // Update user's information in the database
    const updatedUser = await pool.query(
      "UPDATE users SET credit = credit + $1, gold = gold + $2, xp = $3, diamond = diamond + $4 - $5, level = $6 WHERE id = $7 RETURNING *",
      [
        credit,
        gold,
        newXP,
        diamond,
        diamondAmount,
        user.level + increasedLevel,
        user.id,
      ]
    );

    // Update the mission details in the database
    const updatedMission = await pool.query(
      "UPDATE missions SET credit = credit + $1, gold = gold + $2, xp = xp + $3, diamond = diamond + $4, diamond_to_open = diamond_to_open + $5, opened_at = $6, opened_chest = $7 WHERE id = $8 RETURNING *",
      [credit, gold, xp, diamond, diamondAmount, new Date(), true, mission.id]
    );

    // Send response with updated user and mission details
    res.status(200).json({
      user: updatedUser.rows[0],
      mission: updatedMission.rows[0],
      levelIncreased: increasedLevel > 0, // Return whether the level has increased
      newLevel: user.level + increasedLevel, // Return the new level
    });
  } catch (error) {
    console.error("Error opening chest by diamond: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const leaderBoard = async (req, res) => {
  const limit = parseInt(req.query.limit) || 100; // Default limit
  const offset = parseInt(req.query.offset) || 0; // Default offset

  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY credit DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCurrentMissions,
  startMission,
  bringBackAstro,
  openChest,
  openChestByDiamond,
  leaderBoard,
};
