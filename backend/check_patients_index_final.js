const { sequelize } = require('./src/models');

async function checkSchema() {
  try {
    const [results, metadata] = await sequelize.query("PRAGMA index_list('Patients')");
    console.log('INDEX LIST:', JSON.stringify(results, null, 2));
    
    for (const index of results) {
      if (index.name !== 'sqlite_autoindex_Patients_1') {
        const [info, infoMetadata] = await sequelize.query(`PRAGMA index_info('${index.name}')`);
        console.log(`INDEX INFO FOR ${index.name}:`, JSON.stringify(info, null, 2));
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkSchema();
