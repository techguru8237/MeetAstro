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

const rewardDiamonds = async (req, res) => {
  try {
    const reward = socialActionRewards.find(
      (item) => item.action === req.body.action
    );
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

const purchaseDiamonds = async (req, res) => {
  try {
    const updatedUser = await pool.query(
      "UPDATE users SET diamond = diamond + $1 WHERE id = $2 RETURNING *",
      [req.body.amount, req.user.id]
    );

    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const discountFee = async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    const associatedDiscountInfo = feeDiscountRule.find(
      (item) => item.level === user.level
    );

    if (!associatedDiscountInfo) {
      return res.status(404).json({
        status: "failed",
        message: "You can't discount fee in this level.",
      });
    }

    if (user.gold < associatedDiscountInfo.gold) {
      return res.status(404).json({
        status: "failed",
        message: "You don't have enough gold to reduce fee.",
      });
    }

    const updatedUser = await pool.query(
      "UPDATE users SET fee = $1, gold = gold - $2 WHERE id = $3 RETURNING *",
      [associatedDiscountInfo.fee, associatedDiscountInfo.gold, req.user.id]
    );

    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {}
};

const increaseWinchance = async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    const associatedWinchanceInfo = winchanceIncreaseRule.find(
      (item) => item.level === user.level
    );

    if (!associatedWinchanceInfo) {
      return res.status(404).json({
        status: "failed",
        message: "You can't discount fee in this level.",
      });
    }

    if (user.gold < associatedWinchanceInfo.gold) {
      return res.status(404).json({
        status: "failed",
        message: "You don't have enough gold to increase win chance.",
      });
    }

    const updatedUser = await pool.query(
      "UPDATE users SET winchance = $1, gold = gold - $2 WHERE id = $3 RETURNING *",
      [associatedWinchanceInfo.winChance, associatedWinchanceInfo.gold, req.user.id]
    );

    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {}
};

module.exports = {
  createTables,
  rewardDiamonds,
  purchaseDiamonds,
  discountFee,
  increaseWinchance,
};
