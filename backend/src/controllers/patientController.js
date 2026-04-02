const { Patient, DocumentType, PatientDocument } = require('../models');

const createPatient = async (req, res) => {
  try {
    const data = { ...req.body };
    // Evitar error en PostgreSQL con fechas vacías o inválidas
    if (data.birthDate === '' || data.birthDate === 'Invalid date') {
      data.birthDate = null;
    }
    const patient = await Patient.create(data);
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
      include: [
        { model: DocumentType },
        { model: PatientDocument }
      ]
    });
    res.send(patients);
  } catch (e) {
    res.status(500).send();
  }
};

const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: DocumentType },
        { model: PatientDocument }
      ]
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
    const data = { ...req.body };
    // Evitar error en PostgreSQL con fechas vacías o inválidas
    if (data.birthDate === '' || data.birthDate === 'Invalid date') {
      data.birthDate = null;
    }
    await patient.update(data);
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

const uploadPatientDocument = async (req, res) => {
  try {
    const patientId = req.params.id;
    const file = req.file;
    if (!file) {
      return res.status(400).send({ error: 'No se subió ningún archivo' });
    }

    // Determine URL (local or cloud)
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const url = file.location || `${baseUrl}/uploads/${file.filename}`;

    const doc = await PatientDocument.create({
      patientId,
      originalName: file.originalname,
      url,
      mimetype: file.mimetype,
      size: file.size
    });

    res.status(201).send(doc);
  } catch (e) {
    console.error('Error uploading document:', e);
    res.status(500).send({ error: 'Failed to save document' });
  }
};

const deletePatientDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const doc = await PatientDocument.findOne({ where: { id: docId, patientId: id } });
    if (!doc) return res.status(404).send();
    // Todo: delete physical file if needed
    await doc.destroy();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
};

module.exports = { createPatient, getPatients, getPatient, updatePatient, getDocumentTypes, uploadPatientDocument, deletePatientDocument };
