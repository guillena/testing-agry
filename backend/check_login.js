const bcrypt = require('bcryptjs');
const { Professional, sequelize } = require('./src/models');

const check = async () => {
  try {
    const email = 'admin@kumespacio.com';
    const pass = 'admin123';
    
    const prof = await Professional.findOne({ where: { email } });
    if (!prof) {
      console.log('User not found');
    } else {
      console.log('User found:', prof.email);
      const isMatch = await bcrypt.compare(pass, prof.password);
      console.log('Password match:', isMatch);
      console.log('Stored hash:', prof.password);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

check();
