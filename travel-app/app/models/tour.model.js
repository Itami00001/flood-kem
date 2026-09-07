module.exports = (sequelize, Sequelize) => {
  const Tour = sequelize.define("tour", {
    route_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    max_participants: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    current_participants: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    start_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    end_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING(20),
      defaultValue: 'active'
    }
  });

  return Tour;
};
