const { Professional, Benefit } = require('./src/models');

async function test() {
  try {
    const prof = await Professional.create({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser' + Date.now(),
      password: 'testpassword'
    });
    const ben1 = await Benefit.create({ name: 'Ben 1', duration: '1h', price: 100 });
    const ben2 = await Benefit.create({ name: 'Ben 2', duration: '1h', price: 200 });
    
    console.log('Assigning benefits to professional...');
    await prof.setBenefits([ben1.id, ben2.id]);
    
    const profWithBens = await Professional.findByPk(prof.id, { include: [Benefit] });
    console.log('Professional has benefits:', profWithBens.Benefits.length);
    
    console.log('Checking benefit 1 for professionals...');
    const b1 = await Benefit.findByPk(ben1.id, { include: [Professional] });
    console.log('Benefit 1 has professionals:', b1.Professionals.length);
    
    if (b1.Professionals.length > 0) {
      console.log('Delete protection would trigger!');
    } else {
      console.log('Delete protection FAILED!');
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
