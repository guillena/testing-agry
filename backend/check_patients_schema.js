const { sequelize } = require('./src/models');

async function checkSchema() {
  try {
    const [results, metadata] = await sequelize.query("PRAGMA index_list('Patients')");
    console.log('INDEX LIST:', results);
    
    for (const index of results) {
      const [info, infoMetadata] = await sequelize.query(`PRAGMA index_info('${index.name}')`);
      console.log(`INDEX INFO FOR ${index.name}:`, info);
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkSchema();
