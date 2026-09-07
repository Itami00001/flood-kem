module.exports = (sequelize, Sequelize) => {
  const Review = sequelize.define("review", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    tour_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: Sequelize.TEXT
    }
  });

  return Review;
};
