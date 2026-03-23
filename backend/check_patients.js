const { Patient } = require('./src/models');
const { sequelize } = require('./src/models');

async function check() {
  try {
    const table = await sequelize.getQueryInterface().describeTable('Patients');
    console.log(JSON.stringify(table, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
