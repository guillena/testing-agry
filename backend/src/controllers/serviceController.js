const { Service } = require('../models');

const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).send(service);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.send(services);
  } catch (e) {
    res.status(500).send();
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).send();
    }
    await service.update(req.body);
    res.send(service);
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = { createService, getServices, updateService };
