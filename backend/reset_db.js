const { sequelize } = require('./src/models');

async function fix() {
  try {
    console.log('DROPPING AND RECREATING ALL TABLES TO FIX SCHEMA...');
    await sequelize.sync({ force: true });
    console.log('SCHEMA RECREATED SUCCESSFULLY!');
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    process.exit();
  }
}

fix();
