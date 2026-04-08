const { sequelize } = require('./src/models');

async function checkSchema() {
  try {
    const [results, metadata] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='Patients'");
    console.log('---START---');
    console.log(results[0].sql);
    console.log('---END---');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkSchema();
