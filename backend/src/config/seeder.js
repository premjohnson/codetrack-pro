const User = require('../models/User');
const Badge = require('../models/Badge');
const TaskCategory = require('../models/TaskCategory');
const logger = require('./logger');

const seedData = async () => {
  try {
    // 1. Seed default Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@codetrack.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword, // will be hashed by mongoose pre-save hook
        role: 'admin',
        isVerified: true,
        status: 'active',
      });
      logger.info('System Admin user seeded successfully');
    }

    // 2. Seed default Task Categories
    const categories = ['Algorithms', 'Data Structures', 'Database', 'Scripting', 'Logic Puzzles'];
    for (const catName of categories) {
      const catExists = await TaskCategory.findOne({ name: catName });
      if (!catExists) {
        await TaskCategory.create({ name: catName, description: `${catName} questions and tasks` });
      }
    }
    logger.info('Task categories checked/seeded');

    // 3. Seed default Badges
    const defaultBadges = [
      { name: 'Bronze Coder', description: 'Solved 1 task and achieved a 3-day active streak', criteria: { streakRequired: 3, tasksRequired: 1 } },
      { name: 'Silver Coder', description: 'Solved 5 tasks and achieved a 7-day active streak', criteria: { streakRequired: 7, tasksRequired: 5 } },
      { name: 'Gold Coder', description: 'Solved 15 tasks and achieved a 15-day active streak', criteria: { streakRequired: 15, tasksRequired: 15 } },
      { name: 'Platinum Coder', description: 'Solved 30 tasks and achieved a 30-day active streak', criteria: { streakRequired: 30, tasksRequired: 30 } },
      { name: 'Legendary Coder', description: 'Solved 50 tasks and achieved a 60-day active streak', criteria: { streakRequired: 60, tasksRequired: 50 } },
    ];

    for (const badge of defaultBadges) {
      const badgeExists = await Badge.findOne({ name: badge.name });
      if (!badgeExists) {
        await Badge.create(badge);
      }
    }
    logger.info('Achievements badges checked/seeded');

  } catch (error) {
    logger.error('Failed to seed database: %s', error.message);
  }
};

module.exports = seedData;
