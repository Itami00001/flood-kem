const db = require("../models");
const Tour = db.tour;
const Route = db.route;

// Create a new tour
exports.create = (req, res) => {
  if (!req.body.route_id || !req.body.name || !req.body.price || !req.body.max_participants || !req.body.start_date || !req.body.end_date) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const tour = {
    route_id: req.body.route_id,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    max_participants: req.body.max_participants,
    current_participants: req.body.current_participants || 0,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    status: req.body.status || 'active'
  };

  Tour.create(tour)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Tour."
      });
    });
};

// Retrieve all tours
exports.findAll = (req, res) => {
  Tour.findAll({
    include: [{ model: Route, as: 'route' }]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving tours."
      });
    });
};

// Find a single tour by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tour.findByPk(id, {
    include: [{ model: Route, as: 'route' }]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Tour with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Tour with id=" + id
      });
    });
};

// Find active tours
exports.findActive = (req, res) => {
  Tour.findAll({
    where: { status: 'active' },
    include: [{ model: Route, as: 'route' }]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving active tours."
      });
    });
};

// Find tours by route id
exports.findByRoute = (req, res) => {
  const routeId = req.params.routeId;

  Tour.findAll({
    where: { route_id: routeId },
    include: [{ model: Route, as: 'route' }]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving tours by route."
      });
    });
};

// Update a tour by id
exports.update = (req, res) => {
  const id = req.params.id;

  Tour.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tour was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Tour with id=${id}. Maybe Tour was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Tour with id=" + id
      });
    });
};

// Update tour participants
exports.updateParticipants = (req, res) => {
  const id = req.params.id;
  const { current_participants } = req.body;

  Tour.update({ current_participants: current_participants }, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tour participants was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Tour with id=${id}. Maybe Tour was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Tour participants with id=" + id
      });
    });
};

// Delete a tour by id
exports.delete = (req, res) => {
  const id = req.params.id;

  Tour.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tour was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Tour with id=${id}. Maybe Tour was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Tour with id=" + id
      });
    });
};

// Delete all tours
exports.deleteAll = (req, res) => {
  Tour.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Tours were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all tours."
      });
    });
};

// Specialized query: Tour average rating
exports.getTourRating = (req, res) => {
  const query = `
    SELECT
      t.id,
      t.name,
      AVG(r.rating) as average_rating,
      COUNT(r.id) as review_count
    FROM tours t
    LEFT JOIN reviews r ON t.id = r.tour_id
    GROUP BY t.id, t.name
    ORDER BY average_rating DESC
  `;

  db.sequelize.query(query, {
    type: db.Sequelize.QueryTypes.SELECT
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving tour ratings."
      });
    });
};

// Specialized query: Available tours for a period
exports.getAvailableTours = (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    res.status(400).send({
      message: "start_date and end_date query parameters are required!"
    });
    return;
  }

  const query = `
    SELECT DISTINCT
      r.id,
      r.name,
      r.difficulty,
      r.duration_days,
      t.id as tour_id,
      t.name as tour_name,
      t.price,
      t.start_date,
      t.max_participants,
      t.current_participants
    FROM routes r
    JOIN tours t ON r.id = t.route_id
    WHERE t.status = 'active'
      AND t.start_date >= :start_date
      AND t.end_date <= :end_date
      AND t.current_participants < t.max_participants
    ORDER BY t.start_date ASC
  `;

  db.sequelize.query(query, {
    replacements: { start_date, end_date },
    type: db.Sequelize.QueryTypes.SELECT
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving available tours."
      });
    });
};

exports.resetTour = async (req, res) => {
  const id = req.params.id;
  try {
    const tour = await db.tour.findByPk(id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    // Сбрасываем количество участников, но не удаляем брони
    tour.current_participants = 0;
    await tour.save();
    res.json({ message: "Tour reset successfully", tour });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};