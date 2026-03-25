const { sequelize } = require('./src/models');

async function getRawSchema() {
  try {
    const [results] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='ProfessionalBenefits'");
    console.log(results[0].sql);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

getRawSchema();
