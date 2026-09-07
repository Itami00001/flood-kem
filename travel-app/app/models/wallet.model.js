module.exports = (sequelize, Sequelize) => {
  const Wallet = sequelize.define("wallet", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    },
    balance: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 1000.00
    }
  });

  return Wallet;
};
