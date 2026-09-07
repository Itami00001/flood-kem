const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");

/**
 * @swagger
 * /api/wallets:
 *   post:
 *     tags: [Wallets]
 *     summary: Create a new wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *               balance:
 *                 type: number
 *                 default: 1000.00
 *     responses:
 *       201:
 *         description: Wallet created successfully
 */
router.post("/", walletController.create);

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     tags: [Wallets]
 *     summary: Get all wallets
 *     responses:
 *       200:
 *         description: List of wallets
 */
router.get("/", walletController.findAll);

/**
 * @swagger
 * /api/wallets/{id}:
 *   get:
 *     tags: [Wallets]
 *     summary: Get wallet by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wallet found
 *       404:
 *         description: Wallet not found
 */
router.get("/:id", walletController.findOne);

/**
 * @swagger
 * /api/wallets/user/{userId}:
 *   get:
 *     tags: [Wallets]
 *     summary: Get wallet by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wallet found
 *       404:
 *         description: Wallet not found
 */
router.get("/user/:userId", walletController.findByUserId);

/**
 * @swagger
 * /api/wallets/{id}:
 *   put:
 *     tags: [Wallets]
 *     summary: Update wallet by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet updated successfully
 */
router.put("/:id", walletController.update);

/**
 * @swagger
 * /api/wallets/transfer:
 *   post:
 *     tags: [Wallets]
 *     summary: Transfer coins between users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromUserId
 *               - toUserId
 *               - amount
 *             properties:
 *               fromUserId:
 *                 type: integer
 *               toUserId:
 *                 type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 */
router.post("/transfer", walletController.transfer);

/**
 * @swagger
 * /api/wallets/balance/{userId}:
 *   get:
 *     tags: [Wallets]
 *     summary: Get wallet balance with booking history
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wallet balance found
 *       404:
 *         description: Wallet not found
 */
router.get("/balance/:userId", walletController.getWalletBalance);

module.exports = router;
