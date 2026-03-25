const { sequelize, Benefit, Professional, DocumentType, Patient, Appointment } = require('./src/models');
const bcrypt = require('bcryptjs');

async function fixAll() {
  try {
    console.log('Force syncing database (this will recreate tables!)...');
    // Using force: true to be absolutely sure we have the right schema
    await sequelize.sync({ force: true });
    console.log('Tables recreated.');

    // Seed basic data
    const hashedAdminPassword = await bcrypt.hash('admin123', 8);
    await Professional.create({
      firstName: 'Admin',
      lastName: 'Kumespacio',
      username: 'admin',
      password: hashedAdminPassword,
      role: 'admin'
    });
    
    // Seed some benefits
    const ben1 = await Benefit.create({ name: 'Consulta Médica', duration: '30m', price: 5000, description: 'Consulta general' });
    const ben2 = await Benefit.create({ name: 'Psicología', duration: '45m', price: 7000, description: 'Sesión individual' });
    
    // Seed doc types
    await DocumentType.bulkCreate([{ name: 'DNI' }, { name: 'Pasaporte' }]);
    
    console.log('SUCCESS! Database clean and seeded.');
    process.exit(0);
  } catch (e) {
    console.error('ERROR during fixAll:', e);
    process.exit(1);
  }
}

fixAll();
