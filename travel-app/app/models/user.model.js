module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    username: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    full_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    role: {
      type: Sequelize.STRING(20),
      defaultValue: 'user'
    }
  });

  return User;
};
