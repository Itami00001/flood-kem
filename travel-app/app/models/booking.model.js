module.exports = (sequelize, Sequelize) => {
  const Booking = sequelize.define("booking", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    tour_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    participants_count: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    total_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: Sequelize.STRING(20),
      defaultValue: 'pending'
    },
    notes: {
      type: Sequelize.TEXT
    }
  });

  return Booking;
};
