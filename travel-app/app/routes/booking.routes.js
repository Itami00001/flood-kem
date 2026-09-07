const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - tour_id
 *               - participants_count
 *               - total_price
 *             properties:
 *               user_id:
 *                 type: integer
 *               tour_id:
 *                 type: integer
 *               participants_count:
 *                 type: integer
 *               total_price:
 *                 type: number
 *               status:
 *                 type: string
 *                 default: pending
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/", bookingController.create);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/", bookingController.findAll);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Booking not found
 */
router.get("/:id", bookingController.findOne);

/**
 * @swagger
 * /api/bookings/user/{userId}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get bookings by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/user/:userId", bookingController.findByUser);

/**
 * @swagger
 * /api/bookings/tour/{tourId}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get bookings by tour ID
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/tour/:tourId", bookingController.findByTour);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking by ID
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
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking updated successfully
 */
router.put("/:id", bookingController.update);

/**
 * @swagger
 * /api/bookings/{id}/confirm:
 *   put:
 *     tags: [Bookings]
 *     summary: Confirm booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking confirmed successfully
 */
router.put("/:id/confirm", bookingController.confirm);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Delete booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 */
router.delete("/:id", bookingController.delete);

/**
 * @swagger
 * /api/bookings/statistics/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking statistics by month
 *     responses:
 *       200:
 *         description: Booking statistics
 */
router.get("/statistics/bookings", bookingController.getBookingStatistics);

module.exports = router;
