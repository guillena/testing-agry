const { Benefit } = require('../models');

const getBenefits = async (req, res) => {
  try {
    const benefits = await Benefit.findAll();
    res.send(benefits);
  } catch (e) {
    res.status(500).send(e);
  }
};

const createBenefit = async (req, res) => {
  try {
    const benefit = await Benefit.create(req.body);
    res.status(201).send(benefit);
  } catch (e) {
    res.status(400).send(e);
  }
};

const updateBenefit = async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);
    if (!benefit) return res.status(404).send({ error: 'Prestación no encontrada' });

    await benefit.update(req.body);
    res.send(benefit);
  } catch (e) {
    res.status(400).send(e);
  }
};

const deleteBenefit = async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);
    if (!benefit) return res.status(404).send({ error: 'Prestación no encontrada' });

    await benefit.destroy();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = { getBenefits, createBenefit, updateBenefit, deleteBenefit };
