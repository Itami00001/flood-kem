const db = require("../models");
const Booking = db.booking;
const User = db.user;
const Tour = db.tour;

// Create a new booking
exports.create = async (req, res) => {
  if (!req.body.user_id || !req.body.tour_id || !req.body.participants_count || !req.body.total_price) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  try {
    // Get tour to check max participants
    const tour = await Tour.findByPk(req.body.tour_id);
    if (!tour) {
      return res.status(404).send({
        message: "Tour not found."
      });
    }

    // Validate participants count
    if (req.body.participants_count + tour.current_participants > tour.max_participants) {
      return res.status(400).send({
        message: "Количество участников в туре превышает допустимую норму, попробуйте выбрать другую поездку"
      });
    }

    const booking = {
      user_id: req.body.user_id,
      tour_id: req.body.tour_id,
      participants_count: req.body.participants_count,
      total_price: req.body.total_price,
      status: req.body.status || 'pending',
      notes: req.body.notes
    };

    const data = await Booking.create(booking);
    
    // Update tour participants count
    await Tour.update(
      { current_participants: tour.current_participants + req.body.participants_count },
      { where: { id: req.body.tour_id } }
    );

    // Check if tour is now full and create check/notification
    const updatedTour = await Tour.findByPk(req.body.tour_id);
    if (updatedTour.current_participants === updatedTour.max_participants) {
      const Check = db.check;
      if (Check) {
        await Check.create({
          tour_id: req.body.tour_id,
          message: `Тур под номером ${updatedTour.id} отправлен.`,
          created_at: new Date()
        });
      }
    }

    res.send(data);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Booking."
    });
  }
};

// Retrieve all bookings
exports.findAll = (req, res) => {
  Booking.findAll({
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
        message: err.message || "Some error occurred while retrieving bookings."
      });
    });
};

// Find a single booking by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Booking.findByPk(id, {
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
          message: `Cannot find Booking with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Booking with id=" + id
      });
    });
};

// Find bookings by user id
exports.findByUser = (req, res) => {
  const userId = req.params.userId;

  Booking.findAll({
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
        message: err.message || "Error retrieving bookings by user."
      });
    });
};

// Find bookings by tour id
exports.findByTour = (req, res) => {
  const tourId = req.params.tourId;

  Booking.findAll({
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
        message: err.message || "Error retrieving bookings by tour."
      });
    });
};

// Update a booking by id
exports.update = (req, res) => {
  const id = req.params.id;

  Booking.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Booking was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Booking with id=${id}. Maybe Booking was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Booking with id=" + id
      });
    });
};

// Confirm a booking
exports.confirm = (req, res) => {
  const id = req.params.id;

  Booking.update({ status: 'confirmed' }, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Booking was confirmed successfully."
        });
      } else {
        res.send({
          message: `Cannot confirm Booking with id=${id}. Maybe Booking was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error confirming Booking with id=" + id
      });
    });
};

// Delete a booking by id
exports.delete = (req, res) => {
  const id = req.params.id;

  Booking.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Booking was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Booking with id=${id}. Maybe Booking was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Booking with id=" + id
      });
    });
};

// Delete all bookings
exports.deleteAll = (req, res) => {
  Booking.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Bookings were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all bookings."
      });
    });
};

// Specialized query: Booking statistics by month
exports.getBookingStatistics = (req, res) => {
  const query = `
    SELECT
      EXTRACT(MONTH FROM b.created_at) as month,
      EXTRACT(YEAR FROM b.created_at) as year,
      COUNT(*) as total_bookings,
      SUM(b.total_price) as total_revenue
    FROM bookings b
    WHERE b.status = 'confirmed'
    GROUP BY month, year
    ORDER BY year DESC, month DESC
  `;

  db.sequelize.query(query, {
    type: db.Sequelize.QueryTypes.SELECT
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving booking statistics."
      });
    });
};
