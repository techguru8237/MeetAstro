const express = require("express");
const router = express.Router();
const {
  getCurrentMissions,
  startMission,
  bringBackAstro,
  openChest,
  openChestByDiamond,
  leaderBoard,
} = require("../controllers/missionController");

router.get("/", getCurrentMissions);
router.post("/start", startMission);
router.post("/back-astro", bringBackAstro);
router.post("/open-chest", openChest);
router.post("/open-by-diamond", openChestByDiamond);
router.get("/leaderboard", leaderBoard);

module.exports = router;
