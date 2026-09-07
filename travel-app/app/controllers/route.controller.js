const db = require("../models");
const Route = db.route;

// Create a new route
exports.create = (req, res) => {
  if (!req.body.name || !req.body.duration_days) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const route = {
    name: req.body.name,
    description: req.body.description,
    difficulty: req.body.difficulty,
    duration_days: req.body.duration_days,
    distance_km: req.body.distance_km,
    start_location: req.body.start_location,
    end_location: req.body.end_location,
    coordinates_start: req.body.coordinates_start,
    coordinates_end: req.body.coordinates_end
  };

  Route.create(route)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Route."
      });
    });
};

// Retrieve all routes
exports.findAll = (req, res) => {
  Route.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving routes."
      });
    });
};

// Find a single route by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Route.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Route with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Route with id=" + id
      });
    });
};

// Update a route by id
exports.update = (req, res) => {
  const id = req.params.id;

  Route.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Route was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Route with id=${id}. Maybe Route was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Route with id=" + id
      });
    });
};

// Delete a route by id
exports.delete = (req, res) => {
  const id = req.params.id;

  Route.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Route was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Route with id=${id}. Maybe Route was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Route with id=" + id
      });
    });
};

// Delete all routes
exports.deleteAll = (req, res) => {
  Route.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Routes were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all routes."
      });
    });
};

// Filter routes by difficulty
exports.findByDifficulty = (req, res) => {
  const min = req.params.min;
  const max = req.params.max;

  Route.findAll({
    where: {
      difficulty: {
        [db.Sequelize.Op.between]: [min, max]
      }
    }
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving routes by difficulty."
      });
    });
};

// Filter routes by duration
exports.findByDuration = (req, res) => {
  const min = req.params.min;
  const max = req.params.max;

  Route.findAll({
    where: {
      duration_days: {
        [db.Sequelize.Op.between]: [min, max]
      }
    }
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving routes by duration."
      });
    });
};

// Specialized query: Popular routes by booking count
exports.getPopularRoutes = (req, res) => {
  const limit = req.query.limit || 10;

  const query = `
    SELECT r.id, r.name, r.difficulty, COUNT(br.booking_id) as booking_count
    FROM routes r
    LEFT JOIN booking_routes br ON r.id = br.route_id
    GROUP BY r.id, r.name, r.difficulty
    ORDER BY booking_count DESC
    LIMIT :limit
  `;

  db.sequelize.query(query, {
    replacements: { limit: parseInt(limit) },
    type: db.Sequelize.QueryTypes.SELECT
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving popular routes."
      });
    });
};
