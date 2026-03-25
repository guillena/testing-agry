const bcrypt = require('bcryptjs');
const { Professional, Benefit } = require('../models');

const createProfessional = async (req, res) => {
  try {
    let { firstName, lastName, username, password, role, benefitIds, color } = req.body;
    if (role === 'admin') color = '#95a5a6';

    console.log('--- CREATE PROFESSIONAL ---');
    console.log('Body:', JSON.stringify({ ...req.body, password: '***' }));
    
    const hashedPassword = await bcrypt.hash(password, 8);
    const professional = await Professional.create({
      firstName, lastName, username, password: hashedPassword, role, color
    });
    console.log('Created ID:', professional.id);

    if (benefitIds && Array.isArray(benefitIds)) {
      console.log('Setting Benefits:', benefitIds);
      await professional.setBenefits(benefitIds);
    }

    // Refresh professional to include Benefits in the re-fetched object
    const profWithBenefits = await Professional.findByPk(professional.id, {
      include: [Benefit],
      attributes: { exclude: ['password'] }
    });

    console.log('CREATE PROF SUCCESS:', profWithBenefits.username);
    res.status(201).send(profWithBenefits);
  } catch (e) {
    console.error('SERVER ERROR CREATE PROF:', e);
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ error: 'El nombre de usuario ya está en uso. Por favor elija otro.' });
    }
    res.status(400).send({ error: e.message || 'Error al crear profesional', details: e });
  }
};

const getProfessionals = async (req, res) => {
  try {
    const professionals = await Professional.findAll({
      attributes: { exclude: ['password'] },
      include: [Benefit]
    });
    res.send(professionals);
  } catch (e) {
    res.status(500).send(e);
  }
};

const updateProfessional = async (req, res) => {
  try {
    const professional = await Professional.findByPk(req.params.id);
    if (!professional) {
      return res.status(404).send({ error: 'Profesional no encontrado' });
    }
    
    // If password is being updated, hash it
    let updateData = { ...req.body };
    if (updateData.password && updateData.password.trim() !== '') {
      updateData.password = await bcrypt.hash(updateData.password, 8);
    } else {
      // Don't update password if empty string or missing
      delete updateData.password;
    }

    if (updateData.role === 'admin') {
      updateData.color = '#95a5a6';
    }
    
    console.log('--- UPDATE PROFESSIONAL ---');
    console.log('Body:', JSON.stringify({ ...updateData, password: '***' }));
    
    await professional.update(updateData);

    if (updateData.benefitIds && Array.isArray(updateData.benefitIds)) {
      console.log('Updating Benefits:', updateData.benefitIds);
      await professional.setBenefits(updateData.benefitIds);
    }
    
    const profWithBenefits = await Professional.findByPk(professional.id, {
      include: [Benefit],
      attributes: { exclude: ['password'] }
    });
    console.log('UPDATE PROF SUCCESS:', professional.username);
    res.send(profWithBenefits);
  } catch (e) {
    console.error('SERVER ERROR UPDATE PROF:', e);
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ error: 'El nombre de usuario ya está en uso. Por favor elija otro.' });
    }
    res.status(400).send({ error: e.message || 'Error al actualizar profesional' });
  }
};

module.exports = { createProfessional, getProfessionals, updateProfessional };
