const { Professional, Benefit, ProfessionalBenefits } = require('./src/models');

async function fullDebug() {
  try {
    console.log('--- START FULL DEBUG ---');
    const ben = await Benefit.create({ name: 'DEBUG_BEN', duration: '30m', price: 999 });
    const prof = await Professional.create({
      firstName: 'Debug', lastName: 'Prof', username: 'debug' + Date.now(), password: 'password123'
    });
    console.log('IDs:', ben.id, prof.id);
    
    try {
        await prof.setBenefits([ben.id]);
        console.log('SetBenefits SUCCESS');
    } catch (err) {
        console.log('SetBenefits FAILED');
        console.log('Error Name:', err.name);
        console.log('Error Message:', err.message);
        if (err.parent) console.log('Parent Error:', err.parent.message);
    }
    
    process.exit(0);
  } catch (e) {
    console.log('CRITICAL ERROR:', e.message);
    process.exit(1);
  }
}

fullDebug();
