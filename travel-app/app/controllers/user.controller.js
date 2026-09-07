const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");

// Create a new user
exports.create = (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email || !req.body.full_name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = {
    username: req.body.username,
    password_hash: hashedPassword,
    email: req.body.email,
    full_name: req.body.full_name,
    role: req.body.role || 'user'
  };

  User.create(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User."
      });
    });
};

// Retrieve all users
exports.findAll = (req, res) => {
  User.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};

// Find a single user by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  // Validate id is a number
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    console.error('Invalid user ID format:', id);
    return res.status(400).send({
      message: "Invalid user ID format. ID must be a number."
    });
  }

  User.findByPk(numericId, {
    include: [{ model: db.wallet, as: 'wallet' }]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with id=${numericId}.`
        });
      }
    })
    .catch(err => {
      console.error('Error retrieving user:', err);
      res.status(500).send({
        message: err.message || "Error retrieving User with id=" + numericId
      });
    });
};

// Update a user by id
exports.update = (req, res) => {
  const id = req.params.id;

  const updateData = {
    username: req.body.username,
    email: req.body.email,
    full_name: req.body.full_name,
    role: req.body.role
  };

  if (req.body.password) {
    updateData.password_hash = bcrypt.hashSync(req.body.password, 10);
  }

  User.update(updateData, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating User with id=" + id,
      });
    });
};

// Delete a user by id
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete User with id=" + id
      });
    });
};

// Delete all users
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all users."
      });
    });
};

// Specialized query: Top users by total spending
exports.getTopUsers = (req, res) => {
  const limit = req.query.limit || 10;

  const query = `
    SELECT
      u.id,
      u.username,
      u.full_name,
      SUM(b.total_price) as total_spent,
      COUNT(b.id) as booking_count
    FROM users u
    JOIN bookings b ON u.id = b.user_id
    WHERE b.status = 'confirmed'
    GROUP BY u.id, u.username, u.full_name
    ORDER BY total_spent DESC
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
        message: err.message || "Error retrieving top users."
      });
    });
};
