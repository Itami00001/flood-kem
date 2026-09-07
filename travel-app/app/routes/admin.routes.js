const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const isAdmin = require("../middleware/admin.middleware");

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users with wallet balances (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with balances
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get("/users", isAdmin, adminController.getUsersWithBalances);

/**
 * @swagger
 * /api/admin/tours:
 *   get:
 *     tags: [Admin]
 *     summary: Get all tours with booking counts (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tours with booking counts
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get("/tours", isAdmin, adminController.getToursWithBookingCount);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get booking statistics by date (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics by date
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get("/stats", isAdmin, adminController.getBookingsByDate);

/**
 * @swagger
 * /api/admin/checks:
 *   get:
 *     tags: [Admin]
 *     summary: Get all checks (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all checks
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get("/checks", isAdmin, adminController.getAllChecks);

/**
 * @swagger
 * /api/admin/topup:
 *   post:
 *     tags: [Admin]
 *     summary: Top up wallet balance for any user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - amount
 *             properties:
 *               user_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Balance topped up successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Wallet not found
 */
router.post("/topup", isAdmin, adminController.topupWallet);

module.exports = router;
