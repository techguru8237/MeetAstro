const express = require('express')
const { rewardDiamonds, purchaseDiamonds, discountFee, increaseWinchance } = require('../controllers/userController')

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User routes
 */

/**
 * @swagger
 * /api/user/reward:
 *   post:
 *     tags: [User]
 *     summary: Reward diamonds to a user based on their action
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 example: follow_tiktok
 *     responses:
 *       200:
 *         description: User updated successfully with new diamond count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: bentan010918@gmail.com
 *                 password:
 *                   type: string
 *                   example: "$2b$10$.gJn.azzjH1bfFGNkTHrzuzilOpuwdTDEDiQeB73Zn6VLIoB9o0A2"
 *                 level:
 *                   type: integer
 *                   example: 6
 *                 xp:
 *                   type: integer
 *                   example: 356
 *                 windchance:
 *                   type: integer
 *                   example: 80
 *                 fee:
 *                   type: integer
 *                   example: 1
 *                 gold:
 *                   type: integer
 *                   example: 3643
 *                 diamond:
 *                   type: integer
 *                   example: 2140
 *                 credit:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Invalid action or user not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/reward-diamonds", rewardDiamonds) //Receive diamonds from socialmedia actions\

/**
 * @swagger
 * /api/user/purchase-diamonds:
 *   post:
 *     tags: [User]
 *     summary: Purchase diamonds for a user
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       200:
 *         description: User updated successfully with new diamond count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: bentan010918@gmail.com
 *                 password:
 *                   type: string
 *                   example: "$2b$10$.gJn.azzjH1bfFGNkTHrzuzilOpuwdTDEDiQeB73Zn6VLIoB9o0A2"
 *                 level:
 *                   type: integer
 *                   example: 6
 *                 xp:
 *                   type: integer
 *                   example: 356
 *                 windchance:
 *                   type: integer
 *                   example: 80
 *                 fee:
 *                   type: integer
 *                   example: 1
 *                 gold:
 *                   type: integer
 *                   example: 3643
 *                 diamond:
 *                   type: integer
 *                   example: 2640
 *                 credit:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Amount value needed or invalid user
 *       500:
 *         description: Internal Server Error
 */
router.post("/purchase-diamonds", purchaseDiamonds); //Purchase diamonds 

/**
 * @swagger
 * /api/user/discount-fee:
 *   post:
 *     tags: [User]
 *     summary: Discount fee using gold
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: User updated successfully with discounted fee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: bentan010918@gmail.com
 *                 password:
 *                   type: string
 *                   example: "$2b$10$.gJn.azzjH1bfFGNkTHrzuzilOpuwdTDEDiQeB73Zn6VLIoB9o0A2"
 *                 level:
 *                   type: integer
 *                   example: 10
 *                 xp:
 *                   type: integer
 *                   example: 356
 *                 windchance:
 *                   type: integer
 *                   example: 80
 *                 fee:
 *                   type: number
 *                   format: float
 *                   example: 0.9
 *                 gold:
 *                   type: integer
 *                   example: 2643
 *                 diamond:
 *                   type: integer
 *                   example: 2640
 *                 credit:
 *                   type: integer
 *                   example: 200
 *       404:
 *         description: Cannot discount fee at this level or insufficient gold
 *       500:
 *         description: Internal Server Error
 */
router.post("/discount-fee", discountFee); //Discount fee using gold 

/**
 * @swagger
 * /api/user/increase-winchance:
 *   post:
 *     tags: [User]
 *     summary: Increase win chance using specified winChance and gold amount
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               winChance:
 *                 type: integer
 *                 example: 82
 *               gold:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: User updated successfully with new win chance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: bentan010918@gmail.com
 *                 password:
 *                   type: string
 *                   example: "$2b$10$.gJn.azzjH1bfFGNkTHrzuzilOpuwdTDEDiQeB73Zn6VLIoB9o0A2"
 *                 level:
 *                   type: integer
 *                   example: 9
 *                 xp:
 *                   type: integer
 *                   example: 356
 *                 windchance:
 *                   type: integer
 *                   example: 82
 *                 fee:
 *                   type: number
 *                   format: float
 *                   example: 0.9
 *                 gold:
 *                   type: integer
 *                   example: 2643
 *                 diamond:
 *                   type: integer
 *                   example: 2640
 *                 credit:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: winChance and gold required or invalid winChance
 *       403:
 *         description: Insufficient gold to increase win chance
 *       404:
 *         description: Cannot increase win chance at this level
 *       500:
 *         description: Internal Server Error
 */
router.post("/increase-winchance", increaseWinchance); //Increase winchance using gold

module.exports = router