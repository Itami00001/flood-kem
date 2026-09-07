module.exports = (sequelize, Sequelize) => {
  const Check = sequelize.define("check", {
    tour_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  });

  return Check;
};
