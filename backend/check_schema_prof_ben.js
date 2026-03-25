const { sequelize } = require('./src/models');
const queryInterface = sequelize.getQueryInterface();

async function check() {
  try {
    const columns = await queryInterface.describeTable('ProfessionalBenefits');
    console.log(JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
