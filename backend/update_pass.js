const bcrypt = require('bcryptjs');
const { Professional, sequelize } = require('./src/models');

const update = async () => {
  try {
    const email = 'admin@kumespacio.com';
    const pass = 'admin123';
    const hashedPassword = await bcrypt.hash(pass, 8);
    
    const [numAffected] = await Professional.update(
      { password: hashedPassword },
      { where: { email } }
    );
    
    if (numAffected > 0) {
      console.log('✅ Password updated for:', email);
    } else {
      console.log('❌ User not found, no password updated.');
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

update();
