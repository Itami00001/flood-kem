const db = require("../models");
const Review = db.review;
const User = db.user;
const Tour = db.tour;

// Create a new review
exports.create = (req, res) => {
  if (!req.body.user_id || !req.body.tour_id || !req.body.rating) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const review = {
    user_id: req.body.user_id,
    tour_id: req.body.tour_id,
    rating: req.body.rating,
    comment: req.body.comment
  };

  Review.create(review)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Review."
      });
    });
};

// Retrieve all reviews
exports.findAll = (req, res) => {
  Review.findAll({
    include: [
      { model: User, as: 'user' },
      { model: Tour, as: 'tour' }
    ]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving reviews."
      });
    });
};

// Find a single review by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Review.findByPk(id, {
    include: [
      { model: User, as: 'user' },
      { model: Tour, as: 'tour' }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Review with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Review with id=" + id
      });
    });
};

// Find reviews by tour id
exports.findByTour = (req, res) => {
  const tourId = req.params.tourId;

  Review.findAll({
    where: { tour_id: tourId },
    include: [
      { model: User, as: 'user' },
      { model: Tour, as: 'tour' }
    ]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving reviews by tour."
      });
    });
};

// Find reviews by user id
exports.findByUser = (req, res) => {
  const userId = req.params.userId;

  Review.findAll({
    where: { user_id: userId },
    include: [
      { model: User, as: 'user' },
      { model: Tour, as: 'tour' }
    ]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving reviews by user."
      });
    });
};

// Update a review by id
exports.update = (req, res) => {
  const id = req.params.id;

  Review.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Review was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Review with id=${id}. Maybe Review was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Review with id=" + id
      });
    });
};

// Delete a review by id
exports.delete = (req, res) => {
  const id = req.params.id;

  Review.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Review was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Review with id=${id}. Maybe Review was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Review with id=" + id
      });
    });
};

// Delete all reviews
exports.deleteAll = (req, res) => {
  Review.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Reviews were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all reviews."
      });
    });
};

// Specialized query: Tour reviews with user and tour details
exports.getTourReviews = (req, res) => {
  const tourId = req.params.tourId;

  const query = `
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      u.username as reviewer_name,
      t.name as tour_name,
      t.price as tour_price
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN tours t ON r.tour_id = t.id
    WHERE t.id = :tourId
    ORDER BY r.created_at DESC
  `;

  db.sequelize.query(query, {
    replacements: { tourId: parseInt(tourId) },
    type: db.Sequelize.QueryTypes.SELECT
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving tour reviews."
      });
    });
};
