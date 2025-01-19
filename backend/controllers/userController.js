const pool = require("../config/db");
const socialActionRewards = require("../data/socialActionRewards.json");
const feeDiscountRule = require("../data/feeDiscountRule.json");
const winchanceIncreaseRule = require("../data/winchanceIncreaseRule.json");

const createTables = async (req, res) => {
  try {
    await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                level INT DEFAULT 1 CHECK (level >= 1 AND level <= 60),
                xp INT DEFAULT 0,
                windchance INT DEFAULT 80,
                fee FLOAT DEFAULT 1.0,
                gold INT DEFAULT 0,
                diamond INT DEFAULT 0,
                credit INT DEFAULT 0 CHECK (credit >= 0 AND credit <= 9000)
            );

            CREATE TABLE missions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                start_at TIMESTAMP NOT NULL,
                end_at TIMESTAMP NOT NULL,
                mission_type VARCHAR(100) NOT NULL,
                chest_number INT NOT NULL,
                able_to_open_chest_at TIMESTAMP NOT NULL,
                opened_chest BOOLEAN DEFAULT FALSE,
                credit INT DEFAULT 0,
                gold INT DEFAULT 0,
                diamond INT DEFAULT 0,
                xp INT DEFAULT 0,
                diamond_to_open INT DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
    res
      .status(201)
      .json({ message: "Tables 'users' and 'missions' created successfully." });
  } catch (error) {
    console.error("Error creating tables:", error);
    res.status(500).json({ error: "Failed to create tables." });
  }
};

/**
 * Rewards diamonds to the user based on a social action.
 *
 * @param {Object} req - The request object containing:
 *   @param {Object} req.body - The body of the request containing:
 *     @param {string} req.body.action - The action performed by the user.
 *   @param {Object} req.user - The user object containing:
 *     @param {number} req.user.id - The ID of the user receiving the reward.
 *
 * @param {Object} res - The response object used to send responses back to the client.
 *
 * @returns {Promise<void>} - Returns a promise that resolves when the response is sent.
 */
const rewardDiamonds = async (req, res) => {
  try {
    const reward = socialActionRewards.find(
      (item) => item.action === req.body.action
    );

    if(!reward) {
      res.status(400).json({error: "Invalid action"})
    }

    const updatedUser = await pool.query(
      "UPDATE users SET diamond = diamond + $1 WHERE id = $2 RETURNING *",
      [reward.diamond, req.user.id]
    );

    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @function purchaseDiamonds
 * @description Allows a user to purchase diamonds by updating their diamond count in the database.
 * This function checks if the amount is provided and updates the user's diamond count accordingly.
 */
const purchaseDiamonds = async (req, res) => {
  try {
    const amount = parseInt(req.body.amount); // Parse the amount from the request body

    // Validate that the amount is provided and is a valid number
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Amount value needed." });
    }

    // Update the user's diamond count in the database
    const updatedUser = await pool.query(
      "UPDATE users SET diamond = diamond + $1 WHERE id = $2 RETURNING *",
      [amount, req.user.id]
    );

    // Return the updated user information
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.log("error :>> ", error); // Log the error for debugging
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @function discountFee
 * @description Applies a discount to the user's fee based on their level and available gold.
 * This function checks if the user is eligible for a fee discount and updates their fee and gold accordingly.
 */
const discountFee = async (req, res) => {
  try {
    // Fetch the user from the database using their ID
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    console.log('user.rows[0] :>> ', user.rows[0]); // Log user information for debugging

    // Find the associated discount information based on the user's level
    const associatedDiscountInfo = feeDiscountRule.find(
      (item) => item.level == user.rows[0].level // Compare user level with discount rules
    );

    console.log('associatedDiscountInfo :>> ', associatedDiscountInfo); // Log discount info for debugging

    // Check if there is a discount rule for the user's level
    if (!associatedDiscountInfo) {
      return res.status(404).json({
        status: "failed",
        message: "You can't discount fee at this level.",
      });
    }

    // Check if the user has enough gold to apply the discount
    if (user.rows[0].gold < associatedDiscountInfo.gold) {
      return res.status(404).json({
        status: "failed",
        message: "You don't have enough gold to reduce fee.",
      });
    }

    // Update the user's fee and deduct the gold required for the discount
    const updatedUser = await pool.query(
      "UPDATE users SET fee = $1, gold = gold - $2 WHERE id = $3 RETURNING *",
      [associatedDiscountInfo.fee, associatedDiscountInfo.gold, req.user.id]
    );

    // Return the updated user information
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.log("error :>> ", error); // Log the error for debugging
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @function increaseWinchance
 * @description Increases the user's win chance using a specified amount of gold.
 * This function checks if the required win chance and gold are provided,
 * verifies the user's level, and checks if they have enough gold to increase their win chance.
 * If successful, it updates the user's record in the database and returns the updated user information.
 */
const increaseWinchance = async (req, res) => {
  const { winChance, gold } = req.body; // Extract winChance and gold from request body

  try {
    // Validate that winChance and gold are provided
    if (!winChance || !gold) {
      return res.status(400).json("winChance and gold required");
    }

    // Fetch the user from the database using their ID
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    // Find the associated win chance increase rule based on the provided winChance
    const associatedWinchanceInfo = winchanceIncreaseRule.find(
      (item) => item.winChance == winChance // Accessing winChance correctly
    );

    // Check if the provided winChance is valid
    if (!associatedWinchanceInfo) {
      return res.status(400).json("You can't keep that win chance");
    }

    // Check if the user's level is sufficient to increase the win chance
    if (user.rows[0].level < associatedWinchanceInfo.level) {
      return res.status(404).json({
        status: "failed",
        message: "You can't increase win chance at this level.",
      });
    }

    // Check if the user has enough gold to increase win chance
    if (gold < associatedWinchanceInfo.gold) {
      return res.status(403).json({
        status: "failed",
        message: "You don't have enough gold to increase win chance.",
      });
    }

    // Update the user's win chance and deduct the specified gold amount
    const updatedUser = await pool.query(
      "UPDATE users SET winchance = $1, gold = gold - $2 WHERE id = $3 RETURNING *",
      [
        associatedWinchanceInfo.winChance,
        gold,
        req.user.id,
      ]
    );

    // Return the updated user information
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.error("Error occurred while increasing win chance: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createTables,
  rewardDiamonds,
  purchaseDiamonds,
  discountFee,
  increaseWinchance,
};
