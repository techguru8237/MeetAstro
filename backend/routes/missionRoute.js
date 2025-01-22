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

/**
 * @swagger
 * tags:
 *   name: Missions
 *   description: Missions routes
 */

/**
 * @swagger
 * /api/mission:
 *   get:
 *     tags: [Missions]
 *     summary: Search for the current mission, which is a chest that is not open to authenticated users.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of missions available for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Find the lost treasure"
 *                   description:
 *                     type: string
 *                     example: "Locate the treasure chest hidden in the forest."
 *                   able_to_open_chest_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-20T01:40:00Z"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-15T01:40:00Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-18T01:40:00Z"
 *       404:
 *         description: No missions found for the user
 *       500:
 *         description: Internal Server Error
 */
router.get("/", getCurrentMissions);

/**
 * @swagger
 * /api/mission/leaderboard:
 *   get:
 *     tags: [Missions]
 *     summary: Retrieve the leaderboard for users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of results to return
 *         schema:
 *           type: integer
 *           example: 100
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Offset for pagination
 *         schema:
 *           type: integer
 *           example: 0
 *     responses:
 *       200:
 *         description: Successfully retrieved leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: "playerOne"
 *                       level:
 *                         type: integer
 *                         example: 15
 *                       xp:
 *                         type: integer
 *                         example: 1200
 *                       gold:
 *                         type: integer
 *                         example: 5000
 *                       diamond:
 *                         type: integer
 *                         example: 150
 *       400:
 *         description: Bad request, e.g., invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid query parameters"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.get("/leaderboard", leaderBoard);

/**
 * @swagger
 * /api/mission/start:
 *   post:
 *     tags: [Missions]
 *     summary: Start a new mission for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               missionType:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Mission started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 mission:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 176
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     start_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-19T16:43:39.285Z"
 *                     end_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-19T16:46:39.285Z"
 *                     mission_type:
 *                       type: string
 *                       example: "1"
 *                     chest_number:
 *                       type: integer
 *                       example: 0
 *                     able_to_open_chest_at:
 *                       type: string
 *                       format: date-time
 *                       example: null
 *                     opened_chest:
 *                       type: boolean
 *                       example: false
 *                     credit:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Bad request due to validation errors
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/start", startMission);

/**
 * @swagger
 * /api/mission/back-astro:
 *   post:
 *     tags: [Missions]
 *     summary: End a mission early by bringing back Astro
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               missionId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Mission ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 start_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-19T16:43:39.285Z"
 *                 end_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-19T16:45:00.000Z"
 *                 mission_type:
 *                   type: string
 *                   example: "1"
 *                 chest_number:
 *                   type: integer
 *                   example: 0
 *                 able_to_open_chest_at:
 *                   type: string
 *                   format: date-time
 *                   example: null
 *                 opened_chest:
 *                   type: boolean
 *                   example: false
 *                 credit:
 *                   type: integer
 *                   example: 0
 *       400:
 *         description: Bad request due to missing or invalid mission ID
 *       404:
 *         description: Mission not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/back-astro", bringBackAstro);

/**
 * @swagger
 * /api/mission/open-chest:
 *   post:
 *     tags: [Missions]
 *     summary: Open a chest for the authenticated user based on the mission ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               missionId:
 *                 type: integer
 *                 example: 175
 *     responses:
 *       200:
 *         description: Chest opened successfully, returning user and mission details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "bentan010918@gmail.com"
 *                     level:
 *                       type: integer
 *                       example: 10
 *                     xp:
 *                       type: integer
 *                       example: 434
 *                     gold:
 *                       type: integer
 *                       example: 2790
 *                     diamond:
 *                       type: integer
 *                       example: 2644
 *                     credit:
 *                       type: integer
 *                       example: 210
 *                 mission:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 175
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     start_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-19T11:06:56.323Z"
 *                     end_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-19T11:09:56.323Z"
 *                     chest_number:
 *                       type: integer
 *                       example: 1
 *                     able_to_open_chest_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-19T14:09:56.323Z"
 *                     opened_chest:
 *                       type: boolean
 *                       example: true
 *                     credit:
 *                       type: integer
 *                       example: 20
 *                     gold:
 *                       type: integer
 *                       example: 87
 *                     diamond:
 *                       type: integer
 *                       example: 0
 *                     xp:
 *                       type: integer
 *                       example: 4
 *                 levelIncreased:
 *                   type: boolean
 *                   example: false
 *                 newLevel:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Bad request, e.g., mission not found or chest cannot be opened
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: User or mission not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/open-chest", openChest);

/**
 * @swagger
 * /api/mission/open-by-diamond:
 *   post:
 *     tags: [Missions]
 *     summary: Open a chest for the authenticated user using diamonds
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               missionId:
 *                 type: integer
 *                 example: 175
 *               diamondAmount:
 *                 type: integer
 *                 example: 18
 *     responses:
 *       200:
 *         description: Chest opened successfully, returning user and mission details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "bentan010918@gmail.com"
 *                     level:
 *                       type: integer
 *                       example: 10
 *                     xp:
 *                       type: integer
 *                       example: 434
 *                     gold:
 *                       type: integer
 *                       example: 2790
 *                     diamond:
 *                       type: integer
 *                       example: 2632
 *                     credit:
 *                       type: integer
 *                       example: 210
 *                 mission:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 175
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     start_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-19T11:06:56.323Z"
 *                     end_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-19T11:09:56.323Z"
 *                     chest_number:
 *                       type: integer
 *                       example: 1
 *                     able_to_open_chest_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-19T14:09:56.323Z"
 *                     opened_chest:
 *                       type: boolean
 *                       example: true
 *                     credit:
 *                       type: integer
 *                       example: 20
 *                     gold:
 *                       type: integer
 *                       example: 87
 *                     diamond:
 *                       type: integer
 *                       example: 0
 *                     xp:
 *                       type: integer
 *                       example: 4
 *                 levelIncreased:
 *                   type: boolean
 *                   example: false
 *                 newLevel:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Bad request, e.g., mission not found or insufficient diamonds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: User or mission not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/open-by-diamond", openChestByDiamond);

module.exports = router;
