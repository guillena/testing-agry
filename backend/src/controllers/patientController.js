const { Patient, DocumentType } = require('../models');

const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).send(patient);
  } catch (e) {
    console.error('SERVER ERROR CREATE PATIENT:', e);
    res.status(400).send({ 
      error: 'Error de validación o base de datos',
      message: e.message,
      errors: e.errors?.map(err => err.message) || []
    });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{ model: DocumentType }]
    });
    res.send(patients);
  } catch (e) {
    res.status(500).send();
  }
};

const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [{ model: DocumentType }]
    });
    if (!patient) {
      return res.status(404).send();
    }
    res.send(patient);
  } catch (e) {
    res.status(500).send();
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).send();
    }
    await patient.update(req.body);
    res.send(patient);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getDocumentTypes = async (req, res) => {
  try {
    const types = await DocumentType.findAll();
    res.send(types);
  } catch (e) {
    res.status(500).send();
  }
};

module.exports = { createPatient, getPatients, getPatient, updatePatient, getDocumentTypes };
