const db = require("../models");

const isAdmin = async (req, res, next) => {
  try {
    // For demo purposes, we'll check if user is authenticated and has admin role
    // In production, this should use JWT or session-based authentication
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).send({
        message: "Authentication required."
      });
    }

    const user = await db.user.findByPk(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).send({
        message: "Access denied. Admin role required."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).send({
      message: "Error checking admin privileges."
    });
  }
};

module.exports = isAdmin;
