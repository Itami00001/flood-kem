const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tour.controller");

/**
 * @swagger
 * /api/tours:
 *   post:
 *     tags: [Tours]
 *     summary: Create a new tour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - route_id
 *               - name
 *               - price
 *               - max_participants
 *               - start_date
 *               - end_date
 *             properties:
 *               route_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               max_participants:
 *                 type: integer
 *               current_participants:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 default: active
 *     responses:
 *       201:
 *         description: Tour created successfully
 */
router.post("/", tourController.create);

/**
 * @swagger
 * /api/tours:
 *   get:
 *     tags: [Tours]
 *     summary: Get all tours
 *     responses:
 *       200:
 *         description: List of tours
 */
router.get("/", tourController.findAll);

// ── STATIC routes MUST come before /:id ──────────────────────────────────────

/**
 * @swagger
 * /api/tours/active/tours:
 *   get:
 *     tags: [Tours]
 *     summary: Get active tours
 *     responses:
 *       200:
 *         description: List of active tours
 */
router.get("/active/tours", tourController.findActive);

/**
 * @swagger
 * /api/tours/rating/tours:
 *   get:
 *     tags: [Tours]
 *     summary: Get tours with average ratings
 *     responses:
 *       200:
 *         description: List of tours with ratings
 */
router.get("/rating/tours", tourController.getTourRating);

/**
 * @swagger
 * /api/tours/available/tours:
 *   get:
 *     tags: [Tours]
 *     summary: Get available tours for a period
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of available tours
 */
router.get("/available/tours", tourController.getAvailableTours);

/**
 * @swagger
 * /api/tours/route/{routeId}:
 *   get:
 *     tags: [Tours]
 *     summary: Get tours by route ID
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of tours
 */
router.get("/route/:routeId", tourController.findByRoute);

// ── Dynamic /:id routes ───────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tours/{id}:
 *   get:
 *     tags: [Tours]
 *     summary: Get tour by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tour found
 *       404:
 *         description: Tour not found
 */
router.get("/:id", tourController.findOne);

/**
 * @swagger
 * /api/tours/{id}:
 *   put:
 *     tags: [Tours]
 *     summary: Update tour by ID
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
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tour updated successfully
 */
router.put("/:id", tourController.update);

/**
 * @swagger
 * /api/tours/{id}/participants:
 *   put:
 *     tags: [Tours]
 *     summary: Update tour participants
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
 *             required:
 *               - current_participants
 *             properties:
 *               current_participants:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tour participants updated successfully
 */
router.put("/:id/participants", tourController.updateParticipants);

/**
 * @swagger
 * /api/tours/{id}/reset:
 *   put:
 *     tags: [Tours]
 *     summary: Reset tour participants to 0
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tour reset successfully
 */
router.put("/:id/reset", tourController.resetTour);

/**
 * @swagger
 * /api/tours/{id}:
 *   delete:
 *     tags: [Tours]
 *     summary: Delete tour by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tour deleted successfully
 */
router.delete("/:id", tourController.delete);

module.exports = router;
