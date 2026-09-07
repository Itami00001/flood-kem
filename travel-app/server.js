require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Database
const db = require("./app/models");
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel Booking API',
      version: '1.0.0',
      description: 'API для системы учета и анализа туристических маршрутов и путевок',
      contact: {
        name: 'API Support',
        email: 'support@travel-app.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Users', description: 'Управление пользователями' },
      { name: 'Wallets', description: 'Управление кошельками' },
      { name: 'Routes', description: 'Управление маршрутами' },
      { name: 'Tours', description: 'Управление турами' },
      { name: 'Bookings', description: 'Управление бронированиями' },
      { name: 'Reviews', description: 'Управление отзывами' }
    ]
  },
  apis: ['./app/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to travel booking application." });
});

// Routes
app.use('/api/users', require("./app/routes/user.routes"));
app.use('/api/wallets', require("./app/routes/wallet.routes"));
app.use('/api/routes', require("./app/routes/route.routes"));
app.use('/api/tours', require("./app/routes/tour.routes"));
app.use('/api/bookings', require("./app/routes/booking.routes"));
app.use('/api/reviews', require("./app/routes/review.routes"));
app.use('/api/admin', require("./app/routes/admin.routes"));

// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
