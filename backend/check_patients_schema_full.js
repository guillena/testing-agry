const { sequelize } = require('./src/models');

async function checkSchema() {
  try {
    const [results, metadata] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='Patients'");
    process.stdout.write(results[0].sql);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkSchema();
