const express = require("express");
const router = express.Router();
const {
  startMission,
  openChest,
  getMissions,
  openChestByDiamond,
} = require("../controllers/missionController");

router.get("/", getMissions);
router.post("/start", startMission);
router.post("/open-chest", openChest);
router.post("/open-by-diamond", openChestByDiamond);

module.exports = router;
