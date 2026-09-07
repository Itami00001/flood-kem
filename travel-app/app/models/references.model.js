module.exports = (db) => {
  // 1:1 Relationship - User <-> Wallet
  db.user.hasOne(db.wallet, { foreignKey: 'user_id', as: 'wallet' });
  db.wallet.belongsTo(db.user, { foreignKey: 'user_id', as: 'user' });

  // 1:N Relationships
  // User -> Booking
  db.user.hasMany(db.booking, { foreignKey: 'user_id' });
  db.booking.belongsTo(db.user, { foreignKey: 'user_id' });

  // User -> Review
  db.user.hasMany(db.review, { foreignKey: 'user_id' });
  db.review.belongsTo(db.user, { foreignKey: 'user_id' });

  // Route -> Tour
  db.route.hasMany(db.tour, { foreignKey: 'route_id' });
  db.tour.belongsTo(db.route, { foreignKey: 'route_id' });

  // Tour -> Booking
  db.tour.hasMany(db.booking, { foreignKey: 'tour_id' });
  db.booking.belongsTo(db.tour, { foreignKey: 'tour_id' });

  // Tour -> Review
  db.tour.hasMany(db.review, { foreignKey: 'tour_id' });
  db.review.belongsTo(db.tour, { foreignKey: 'tour_id' });

  // Tour -> Check
  db.tour.hasMany(db.check, { foreignKey: 'tour_id' });
  db.check.belongsTo(db.tour, { foreignKey: 'tour_id' });

  // N:M Relationship - Booking <-> Route through BookingRoute
  db.booking.belongsToMany(db.route, { 
    through: db.bookingRoute,
    foreignKey: 'booking_id',
    otherKey: 'route_id'
  });
  db.route.belongsToMany(db.booking, { 
    through: db.bookingRoute,
    foreignKey: 'route_id',
    otherKey: 'booking_id'
  });
};
