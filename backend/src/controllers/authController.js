const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Professional } = require('../models');

const register = async (req, res) => {
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
    
    const token = jwt.sign({ id: professional.id }, process.env.JWT_SECRET);
    res.status(201).send({ professional, token });
  } catch (e) {
    res.status(400).send(e);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const professional = await Professional.findOne({ where: { email } });

    if (!professional) {
      return res.status(404).send({ error: 'Unable to login' });
    }

    const isMatch = await bcrypt.compare(password, professional.password);

    if (!isMatch) {
      return res.status(404).send({ error: 'Unable to login' });
    }

    const token = jwt.sign({ id: professional.id }, process.env.JWT_SECRET);
    res.send({ professional, token });
  } catch (e) {
    res.status(400).send();
  }
};

module.exports = { register, login };
