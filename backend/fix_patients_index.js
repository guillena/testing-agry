const { sequelize } = require('./src/models');

async function migrate() {
  const transaction = await sequelize.transaction();
  try {
    console.log('Starting manual migration for Patients table...');
    
    // 1. Check if the table exists
    const [tableExists] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='Patients'");
    if (tableExists.length === 0) {
      console.log('Table Patients does not exist. Syncing normally...');
      await sequelize.sync();
      return;
    }

    // 2. Backup data
    console.log('Backing up data...');
    await sequelize.query('CREATE TABLE Patients_backup AS SELECT * FROM Patients', { transaction });
    
    // 3. Drop table
    console.log('Dropping old table...');
    await sequelize.query('DROP TABLE Patients', { transaction });
    
    // 4. Recreate table with new schema
    console.log('Recreating table with new schema...');
    await sequelize.sync({ transaction }); 
    
    // 5. Restore data (ignoring errors if any weird data exists)
    // Note: We need to map columns if they changed, but here docTypeId and docNumber are the same.
    // However, if some data didn't have docTypeId, we might need to handle it.
    console.log('Restoring data...');
    await sequelize.query('INSERT INTO Patients SELECT * FROM Patients_backup', { transaction });
    
    // 6. Drop backup
    console.log('Dropping backup...');
    await sequelize.query('DROP TABLE Patients_backup', { transaction });
    
    await transaction.commit();
    console.log('Migration successful!');
  } catch (e) {
    if (transaction) await transaction.rollback();
    console.error('Migration failed:', e);
  } finally {
    process.exit();
  }
}

migrate();
