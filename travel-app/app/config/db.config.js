module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "travel_user",
  PASSWORD: process.env.DB_PASSWORD || "travel_password",
  DB: process.env.DB_NAME || "travel_db",
  port: process.env.DB_PORT || "5432",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
