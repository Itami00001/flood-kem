const db = require("../models");
const bcrypt = require("bcryptjs");

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // Sync database with force: true to recreate tables
    await db.sequelize.sync({ force: true });
    console.log("Database synced.");

    // Create users
    const adminPassword = bcrypt.hashSync("adminadmin", 10);
    const testPassword = bcrypt.hashSync("testtest", 10);

    const admin = await db.user.create({
      username: "admin",
      password_hash: adminPassword,
      email: "admin@travel.com",
      full_name: "Administrator",
      role: "admin"
    });

    const test = await db.user.create({
      username: "test",
      password_hash: testPassword,
      email: "test@travel.com",
      full_name: "Test User",
      role: "user"
    });

    console.log("Users created.");

    // Create wallets with 1000 COIN balance
    await db.wallet.create({
      user_id: admin.id,
      balance: 1000.00
    });

    await db.wallet.create({
      user_id: test.id,
      balance: 1000.00
    });

    console.log("Wallets created.");

    // Create sample routes
    const route1 = await db.route.create({
      name: "Mountain Trail Adventure",
      description: "A challenging mountain trail with beautiful views",
      difficulty: 7,
      duration_days: 5,
      distance_km: 45.5,
      start_location: "Base Camp",
      end_location: "Summit",
      coordinates_start: "55.7558,37.6173",
      coordinates_end: "56.8389,60.6057"
    });

    const route2 = await db.route.create({
      name: "Coastal Path Walk",
      description: "A relaxing coastal walk along the beach",
      difficulty: 3,
      duration_days: 3,
      distance_km: 25.0,
      start_location: "Harbor",
      end_location: "Lighthouse",
      coordinates_start: "59.9343,30.3351",
      coordinates_end: "59.9398,30.3146"
    });

    const route3 = await db.route.create({
      name: "Forest Exploration",
      description: "Explore the deep forest with wildlife",
      difficulty: 5,
      duration_days: 4,
      distance_km: 32.0,
      start_location: "Forest Edge",
      end_location: "Forest Center",
      coordinates_start: "55.0084,82.9357",
      coordinates_end: "55.0300,82.9500"
    });

    console.log("Routes created.");

    // Create sample tours
    const tour1 = await db.tour.create({
      route_id: route1.id,
      name: "Summer Mountain Expedition",
      description: "Experience the mountains in summer",
      price: 500.00,
      max_participants: 10,
      current_participants: 0,
      start_date: "2026-07-01",
      end_date: "2026-07-05",
      status: "active"
    });

    const tour2 = await db.tour.create({
      route_id: route2.id,
      name: "Autumn Coastal Walk",
      description: "Enjoy the coast in autumn",
      price: 300.00,
      max_participants: 15,
      current_participants: 0,
      start_date: "2026-09-15",
      end_date: "2026-09-17",
      status: "active"
    });

    const tour3 = await db.tour.create({
      route_id: route3.id,
      name: "Spring Forest Tour",
      description: "Discover the forest in spring",
      price: 350.00,
      max_participants: 12,
      current_participants: 0,
      start_date: "2026-05-10",
      end_date: "2026-05-13",
      status: "active"
    });

    // 4 additional tours
    const tour4 = await db.tour.create({
      route_id: route1.id,
      name: "Winter Mountain Challenge",
      description: "Conquer the mountains in winter conditions",
      price: 650.00,
      max_participants: 8,
      current_participants: 0,
      start_date: "2026-12-10",
      end_date: "2026-12-14",
      status: "active"
    });

    const tour5 = await db.tour.create({
      route_id: route2.id,
      name: "Spring Coastal Sunrise",
      description: "Watch the sunrise on the coast",
      price: 280.00,
      max_participants: 20,
      current_participants: 0,
      start_date: "2026-04-05",
      end_date: "2026-04-07",
      status: "active"
    });

    const tour6 = await db.tour.create({
      route_id: route3.id,
      name: "Autumn Forest Mushroom Hunt",
      description: "Pick mushrooms and enjoy autumn colors",
      price: 200.00,
      max_participants: 15,
      current_participants: 0,
      start_date: "2026-10-03",
      end_date: "2026-10-06",
      status: "active"
    });

    const tour7 = await db.tour.create({
      route_id: route1.id,
      name: "Night Sky Mountain Trek",
      description: "Stargazing hike to the summit",
      price: 420.00,
      max_participants: 6,
      current_participants: 0,
      start_date: "2026-08-20",
      end_date: "2026-08-24",
      status: "active"
    });

    console.log("Tours created.");

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
