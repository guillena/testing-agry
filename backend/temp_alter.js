const { sequelize } = require('./src/models');

async function alterDb() {
  try {
    const queries = [
      'ALTER TABLE Patients ADD COLUMN street VARCHAR(255);',
      'ALTER TABLE Patients ADD COLUMN number VARCHAR(255);',
      'ALTER TABLE Patients ADD COLUMN floor VARCHAR(255);',
      'ALTER TABLE Patients ADD COLUMN apartment VARCHAR(255);',
      'ALTER TABLE Patients ADD COLUMN province VARCHAR(255);',
      'ALTER TABLE Patients ADD COLUMN city VARCHAR(255);',
      'ALTER TABLE Patients ADD COLUMN postalCode VARCHAR(255);',
      'ALTER TABLE Patients DROP COLUMN address;'
    ];
    
    for (const q of queries) {
      console.log(`Executing: ${q}`);
      await sequelize.query(q).catch(e => console.log(`Ignored error: ${e.message}`));
    }
    
    console.log('Done altering table');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

alterDb();
