const bcrypt = require('bcryptjs');
const { Professional } = require('../models');

const createProfessional = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const professional = await Professional.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role
    });
    // Remove password from response
    const { password: _, ...profObj } = professional.toJSON();
    res.status(201).send(profObj);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getProfessionals = async (req, res) => {
  try {
    const professionals = await Professional.findAll({
      attributes: { exclude: ['password'] }
    });
    res.send(professionals);
  } catch (e) {
    res.status(500).send();
  }
};

const updateProfessional = async (req, res) => {
  try {
    const professional = await Professional.findByPk(req.params.id);
    if (!professional) {
      return res.status(404).send();
    }
    
    // If password is being updated, hash it
    let updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 8);
    }
    
    await professional.update(updateData);
    
    const { password: _, ...profObj } = professional.toJSON();
    res.send(profObj);
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = { createProfessional, getProfessionals, updateProfessional };
