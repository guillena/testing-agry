const { Benefit, Professional } = require('./src/models');

async function checkPlural() {
  try {
    const ben = await Benefit.findOne({ include: [Professional] });
    if (!ben) { console.log('None found'); return; }
    console.log('Included objects:', Object.keys(ben.get()));
    // Check if it's 'Professionals' or 'Profesionals' or something else
    const keys = Object.keys(ben.get()).filter(k => Array.isArray(ben[k]));
    console.log('Pluralized keys:', keys);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkPlural();
