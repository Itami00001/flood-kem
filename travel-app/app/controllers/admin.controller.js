const db = require("../models");

// Get all users with their wallet balances
exports.getUsersWithBalances = (req, res) => {
  db.user.findAll({
    include: [{ model: db.wallet, as: 'wallet' }],
    attributes: { exclude: ['password_hash'] }
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error('Error retrieving users with balances:', err);
      res.status(500).send({
        message: err.message || "Error retrieving users with balances."
      });
    });
};

// Get all tours with booking count
exports.getToursWithBookingCount = (req, res) => {
  const query = `
    SELECT 
      t.id,
      t.name,
      t.max_participants,
      t.current_participants,
      t.price,
      t.status,
      COUNT(b.id) as booking_count,
      COUNT(DISTINCT c.id) as check_count
    FROM tours t
    LEFT JOIN bookings b ON t.id = b.tour_id
    LEFT JOIN checks c ON t.id = c.tour_id
    GROUP BY t.id, t.name, t.max_participants, t.current_participants, t.price, t.status
    ORDER BY t.id
  `;

  db.sequelize.query(query, {
    type: db.Sequelize.QueryTypes.SELECT
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error('Error retrieving tours with booking count:', err);
      res.status(500).send({
        message: err.message || "Error retrieving tours with booking count."
      });
    });
};

// Get bookings statistics by date for admin dashboard
exports.getBookingsByDate = (req, res) => {
  const query = `
    SELECT 
      DATE(b.created_at) as date,
      COUNT(*) as booking_count,
      SUM(b.total_price) as total_revenue
    FROM bookings b
    WHERE b.status = 'confirmed'
    GROUP BY DATE(b.created_at)
    ORDER BY date DESC
    LIMIT 30
  `;

  db.sequelize.query(query, {
    type: db.Sequelize.QueryTypes.SELECT
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error('Error retrieving bookings by date:', err);
      res.status(500).send({
        message: err.message || "Error retrieving bookings by date."
      });
    });
};

// Get all checks for admin view
exports.getAllChecks = (req, res) => {
  db.check.findAll({
    include: [{ model: db.tour, as: 'tour' }],
    order: [['created_at', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.error('Error retrieving checks:', err);
      res.status(500).send({
        message: err.message || "Error retrieving checks."
      });
    });
};

// Admin: topup wallet balance for any user
exports.topupWallet = async (req, res) => {
  const { user_id, amount } = req.body;

  if (!user_id || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).send({ message: "user_id and positive amount are required." });
  }

  try {
    const wallet = await db.wallet.findOne({ where: { user_id } });
    if (!wallet) {
      return res.status(404).send({ message: `Wallet for user_id=${user_id} not found.` });
    }
    wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
    await wallet.save();
    res.send({ message: "Balance topped up successfully.", balance: wallet.balance });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error topping up wallet." });
  }
};
