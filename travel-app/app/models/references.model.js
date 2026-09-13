module.exports = (db) => {
  // 1:1 Relationship - User <-> Wallet
  db.user.hasOne(db.wallet, { 
    foreignKey: 'user_id', 
    as: 'wallet',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  db.wallet.belongsTo(db.user, { 
    foreignKey: 'user_id', 
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // 1:N Relationships
  // User -> Booking
  db.user.hasMany(db.booking, { 
    foreignKey: 'user_id',
    as: 'bookings',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  db.booking.belongsTo(db.user, { 
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // User -> Review
  db.user.hasMany(db.review, { 
    foreignKey: 'user_id',
    as: 'reviews',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  db.review.belongsTo(db.user, { 
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Route -> Tour
  db.route.hasMany(db.tour, { 
    foreignKey: 'route_id',
    as: 'tours',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  db.tour.belongsTo(db.route, { 
    foreignKey: 'route_id',
    as: 'route',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Tour -> Booking
  db.tour.hasMany(db.booking, { 
    foreignKey: 'tour_id',
    as: 'bookings',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  db.booking.belongsTo(db.tour, { 
    foreignKey: 'tour_id',
    as: 'tour',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Tour -> Review
  db.tour.hasMany(db.review, { 
    foreignKey: 'tour_id',
    as: 'reviews',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  db.review.belongsTo(db.tour, { 
    foreignKey: 'tour_id',
    as: 'tour',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Tour -> Check
  db.tour.hasMany(db.check, { 
    foreignKey: 'tour_id',
    as: 'checks',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  db.check.belongsTo(db.tour, { 
    foreignKey: 'tour_id',
    as: 'tour',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // N:M Relationship - Booking <-> Route through BookingRoute
  db.booking.belongsToMany(db.route, { 
    through: db.bookingRoute,
    foreignKey: 'booking_id',
    otherKey: 'route_id',
    as: 'routes'
  });
  db.route.belongsToMany(db.booking, { 
    through: db.bookingRoute,
    foreignKey: 'route_id',
    otherKey: 'booking_id',
    as: 'bookings'
  });
};
