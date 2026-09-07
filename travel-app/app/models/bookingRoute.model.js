module.exports = (sequelize, Sequelize) => {
  const BookingRoute = sequelize.define("booking_route", {
    booking_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    route_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    order_index: {
      type: Sequelize.INTEGER
    }
  });

  return BookingRoute;
};
