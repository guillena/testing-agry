const { Benefit, Professional } = require('../models');

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

    console.log('--- DELETE BENEFIT ATTEMPT ---');
    console.log('ID:', req.params.id);
    
    // Check if it's assigned to any professional by querying the Professional model
    const assignedProfs = await Professional.findAll({
      include: [{
        model: Benefit,
        where: { id: req.params.id },
        required: true
      }]
    });

    console.log('Professionals FOUND:', assignedProfs.length);
    
    if (assignedProfs.length > 0) {
      console.log('BLOCKING DELETE - ASSIGNED PROFS:', assignedProfs.map(p => p.username));
      return res.status(400).send({ 
        error: `Esta prestación no puede ser eliminada porque está vinculada a los siguientes profesionales activos: \n\n${assignedProfs.map(p => `${p.firstName} ${p.lastName}`).join(', ')} \n\nPara poder borrarla, primero debes desvincularla de sus perfiles en la pestaña de Profesionales.` 
      });
    }

    await benefit.destroy();
    res.send({ message: 'Prestación eliminada correctamente' });
  } catch (e) {
    console.error('DELETE BENEFIT ERROR:', e);
    res.status(500).send(e);
  }
};

module.exports = { getBenefits, createBenefit, updateBenefit, deleteBenefit };
