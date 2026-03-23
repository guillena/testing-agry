const bcrypt = require('bcryptjs');
const { Professional, Benefit } = require('../models');

const createProfessional = async (req, res) => {
  try {
    const { firstName, lastName, username, password, role, benefitIds } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const professional = await Professional.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role
    });

    if (benefitIds && Array.isArray(benefitIds)) {
      await professional.setBenefits(benefitIds);
    }

    // Refresh professional to include Benefits in the re-fetched object
    const profWithBenefits = await Professional.findByPk(professional.id, {
      include: [Benefit],
      attributes: { exclude: ['password'] }
    });

    res.status(201).send(profWithBenefits);
  } catch (e) {
    console.error('SERVER ERROR CREATE PROF:', e);
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
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 8);
    }
    
    await professional.update(updateData);

    if (updateData.benefitIds && Array.isArray(updateData.benefitIds)) {
      await professional.setBenefits(updateData.benefitIds);
    }
    
    const profWithBenefits = await Professional.findByPk(professional.id, {
      include: [Benefit],
      attributes: { exclude: ['password'] }
    });
    res.send(profWithBenefits);
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = { createProfessional, getProfessionals, updateProfessional };
