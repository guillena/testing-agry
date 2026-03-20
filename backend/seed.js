const bcrypt = require('bcryptjs');
const { Professional, DocumentType, sequelize } = require('./src/models');

const seed = async () => {
  try {
    // Sync Database Schema
    await sequelize.sync();

    // Create Document Types
    await DocumentType.findOrCreate({ where: { name: 'DNI' } });
    await DocumentType.findOrCreate({ where: { name: 'Pasaporte' } });

    // Create Admin User
    const password = await bcrypt.hash('admin123', 8);
    const [admin, created] = await Professional.findOrCreate({
      where: { email: 'admin@kumespacio.com' },
      defaults: {
        firstName: 'Admin',
        lastName: 'Kumespacio',
        password: password,
        role: 'admin'
      }
    });

    if (created) {
      console.log('✅ Usuario Admin creado con éxito: admin@kumespacio.com / admin123');
    } else {
      console.log('ℹ️ El usuario Admin ya existe.');
    }

    process.exit(0);
  } catch (e) {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  }
};

seed();
