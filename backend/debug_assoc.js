const { Professional, Benefit } = require('./src/models');

async function debug() {
  try {
    const benefit = await Benefit.findOne({
      include: [Professional]
    });
    if (!benefit) {
      console.log('No benefit found in DB');
    } else {
      console.log('Benefit keys:', Object.keys(benefit.get()));
      console.log('Include keys?', Object.keys(benefit));
      console.log('Professionals length:', benefit.Professionals ? benefit.Professionals.length : 'NOT FOUND');
      // If it's something else like 'prestacion_profesionals' or something...
      const associatedKeys = Object.keys(benefit).filter(k => Array.isArray(benefit[k]));
      console.log('Array keys:', associatedKeys);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

debug();
