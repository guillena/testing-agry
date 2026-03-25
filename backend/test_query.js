const { Professional, Benefit } = require('./src/models');

async function testQuery() {
  try {
    const ben = await Benefit.findOne();
    if (!ben) { console.log('No benefits found'); return; }
    
    // Assign professional to benefit first
    const prof = await Professional.findOne();
    if (!prof) { console.log('No professionals found'); return; }
    
    console.log('--- TEST DATA ---');
    console.log('Benefit:', ben.name, ben.id);
    console.log('Professional:', prof.username, prof.id);
    
    await prof.setBenefits([ben.id]);
    
    const assignedProfs = await Professional.findAll({
      include: [{
        model: Benefit,
        where: { id: ben.id },
        required: true
      }]
    });
    
    console.log('Result length:', assignedProfs.length);
    if (assignedProfs.length > 0) {
      console.log('FOUND:', assignedProfs[0].username);
      console.log('DELETION WOULD BE BLOCKED');
    } else {
      console.log('NOT FOUND! DELETION WOULD FAIL!');
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testQuery();
