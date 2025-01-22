const express = require("express");
const {
  rewardDiamonds,
  purchaseDiamonds,
  discountFee,
  increaseWinchance,
} = require("../controllers/userController");

const router = express.Router();

router.post("/reward-diamonds", rewardDiamonds); //Receive diamonds from socialmedia actions\
router.post("/purchase-diamonds", purchaseDiamonds); //Purchase diamonds
router.post("/discount-fee", discountFee); //Discount fee using gold
router.post("/increase-winchance", increaseWinchance); //Increase winchance using gold

module.exports = router;
