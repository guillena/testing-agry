const { sequelize } = require('./src/models');

async function syncDb() {
  try {
    console.log('Syncing database with alter: true to remove duration and price...');
    await sequelize.sync({ alter: true });
    console.log('Sync successful.');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing:', err);
    process.exit(1);
  }
}

syncDb();
