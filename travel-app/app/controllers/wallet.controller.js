const db = require("../models");
const Wallet = db.wallet;
const User = db.user;

// Create a new wallet
exports.create = (req, res) => {
  if (!req.body.user_id) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const wallet = {
    user_id: req.body.user_id,
    balance: req.body.balance || 1000.00
  };

  Wallet.create(wallet)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Wallet."
      });
    });
};

// Retrieve all wallets
exports.findAll = (req, res) => {
  Wallet.findAll({
    include: [{ model: User, as: 'user' }]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving wallets."
      });
    });
};

// Find a single wallet by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Wallet.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Wallet with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Wallet with id=" + id
      });
    });
};

// Find wallet by user id
exports.findByUserId = (req, res) => {
  const userId = req.params.userId;

  Wallet.findOne({
    where: { user_id: userId },
    include: [{ model: User, as: 'user' }]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Wallet with user_id=${userId}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Wallet with user_id=" + userId
      });
    });
};

// Update a wallet by id
exports.update = (req, res) => {
  const id = req.params.id;

  Wallet.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Wallet was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Wallet with id=${id}. Maybe Wallet was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Wallet with id=" + id
      });
    });
};

// Transfer coins between users
exports.transfer = (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  if (!fromUserId || !toUserId || !amount) {
    res.status(400).send({
      message: "fromUserId, toUserId, and amount are required!"
    });
    return;
  }

  db.sequelize.transaction(async (t) => {
    // Deduct from sender
    await Wallet.update(
      { balance: db.sequelize.literal(`balance - ${amount}`) },
      { 
        where: { user_id: fromUserId },
        transaction: t
      }
    );

    // Add to receiver
    await Wallet.update(
      { balance: db.sequelize.literal(`balance + ${amount}`) },
      { 
        where: { user_id: toUserId },
        transaction: t
      }
    );
  })
    .then(() => {
      res.send({
        message: "Transfer completed successfully!"
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error transferring coins."
      });
    });
};

// Delete a wallet by id
exports.delete = (req, res) => {
  const id = req.params.id;

  Wallet.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Wallet was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Wallet with id=${id}. Maybe Wallet was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Wallet with id=" + id
      });
    });
};

// Delete all wallets
exports.deleteAll = (req, res) => {
  Wallet.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Wallets were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all wallets."
      });
    });
};

// Specialized query: Wallet balance with transaction history
exports.getWalletBalance = (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT
      w.id,
      w.user_id,
      u.username,
      w.balance,
      (SELECT COUNT(*) FROM bookings WHERE user_id = w.user_id AND status = 'confirmed') as confirmed_bookings
    FROM wallets w
    JOIN users u ON w.user_id = u.id
    WHERE w.user_id = :userId
  `;

  db.sequelize.query(query, {
    replacements: { userId: parseInt(userId) },
    type: db.Sequelize.QueryTypes.SELECT
  })
    .then(data => {
      if (data.length > 0) {
        res.send(data[0]);
      } else {
        res.status(404).send({
          message: `Cannot find Wallet with user_id=${userId}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving wallet balance."
      });
    });
};
