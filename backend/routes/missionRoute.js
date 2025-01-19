const express = require("express");
const router = express.Router();
const {
  getMissions,
  startMission,
  bringBackAstro,
  openChest,
  openChestByDiamond,
} = require("../controllers/missionController");

router.get("/", getMissions);
router.post("/start", startMission);
router.post("/back-astro", bringBackAstro);
router.post("/open-chest", openChest);
router.post("/open-by-diamond", openChestByDiamond);

module.exports = router;
