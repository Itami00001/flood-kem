module.exports = (sequelize, Sequelize) => {
  const Route = sequelize.define("route", {
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    difficulty: {
      type: Sequelize.INTEGER,
      validate: {
        min: 1,
        max: 10
      }
    },
    duration_days: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    distance_km: {
      type: Sequelize.DECIMAL(10, 2)
    },
    start_location: {
      type: Sequelize.STRING(100)
    },
    end_location: {
      type: Sequelize.STRING(100)
    },
    coordinates_start: {
      type: Sequelize.STRING(50)
    },
    coordinates_end: {
      type: Sequelize.STRING(50)
    }
  });

  return Route;
};
