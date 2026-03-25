const { Activity, Professional } = require('../models');

const createActivity = async (req, res) => {
  try {
    const { patientId, description } = req.body;
    const professionalId = req.professional.id; // from auth middleware

    const activity = await Activity.create({
      patientId,
      professionalId,
      description
    });

    const populatedActivity = await Activity.findByPk(activity.id, {
      include: [
        { model: Professional, attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    res.status(201).send(populatedActivity);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getPatientActivities = async (req, res) => {
  try {
    const { patientId } = req.params;

    const activities = await Activity.findAll({
      where: { patientId },
      include: [
        { model: Professional, attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['date', 'DESC']]
    });

    res.send(activities);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = { createActivity, getPatientActivities };
