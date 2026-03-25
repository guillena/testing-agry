const { sequelize } = require('./src/models');

async function fix() {
  try {
    console.log('Dropping ProfessionalBenefits table...');
    await sequelize.getQueryInterface().dropTable('ProfessionalBenefits');
    console.log('Syncing models to recreate table...');
    await sequelize.sync();
    console.log('SUCCESS! Table recreated with correct constraints.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
