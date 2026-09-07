const express = require("express");
const router = express.Router();
const routeController = require("../controllers/route.controller");

/**
 * @swagger
 * /api/routes:
 *   post:
 *     tags: [Routes]
 *     summary: Create a new route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - duration_days
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               duration_days:
 *                 type: integer
 *               distance_km:
 *                 type: number
 *               start_location:
 *                 type: string
 *               end_location:
 *                 type: string
 *               coordinates_start:
 *                 type: string
 *               coordinates_end:
 *                 type: string
 *     responses:
 *       201:
 *         description: Route created successfully
 */
router.post("/", routeController.create);

/**
 * @swagger
 * /api/routes:
 *   get:
 *     tags: [Routes]
 *     summary: Get all routes
 *     responses:
 *       200:
 *         description: List of routes
 */
router.get("/", routeController.findAll);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     tags: [Routes]
 *     summary: Get route by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route found
 *       404:
 *         description: Route not found
 */
router.get("/:id", routeController.findOne);

/**
 * @swagger
 * /api/routes/{id}:
 *   put:
 *     tags: [Routes]
 *     summary: Update route by ID
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
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: integer
 *               duration_days:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Route updated successfully
 */
router.put("/:id", routeController.update);

/**
 * @swagger
 * /api/routes/{id}:
 *   delete:
 *     tags: [Routes]
 *     summary: Delete route by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Route deleted successfully
 */
router.delete("/:id", routeController.delete);

/**
 * @swagger
 * /api/routes/difficulty/{min}/{max}:
 *   get:
 *     tags: [Routes]
 *     summary: Get routes by difficulty range
 *     parameters:
 *       - in: path
 *         name: min
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: max
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of routes
 */
router.get("/difficulty/:min/:max", routeController.findByDifficulty);

/**
 * @swagger
 * /api/routes/duration/{min}/{max}:
 *   get:
 *     tags: [Routes]
 *     summary: Get routes by duration range
 *     parameters:
 *       - in: path
 *         name: min
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: max
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of routes
 */
router.get("/duration/:min/:max", routeController.findByDuration);

/**
 * @swagger
 * /api/routes/popular/routes:
 *   get:
 *     tags: [Routes]
 *     summary: Get popular routes by booking count
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of popular routes
 */
router.get("/popular/routes", routeController.getPopularRoutes);

module.exports = router;
