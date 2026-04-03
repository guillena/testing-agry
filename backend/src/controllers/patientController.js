const { Patient, DocumentType, PatientDocument } = require('../models');
const fs = require('fs');
const path = require('path');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

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

    const patient = await Patient.findByPk(patientId);
    const folderName = patient ? patient.docNumber : patientId;

    // Determine URL (local or cloud)
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const url = file.location || `${baseUrl}/uploads/${folderName}/${file.filename}`;

    // Fix filename encoding (Multer handles it as latin1)
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const doc = await PatientDocument.create({
      patientId,
      originalName,
      url,
      mimetype: file.mimetype,
      size: file.size,
      isConformity: req.body.isConformity === 'true' || req.body.isConformity === true
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

    // 1. Delete physical file if using local storage
    const patient = await Patient.findByPk(id);
    if (patient) {
      const folderName = patient.docNumber;
      // Get filename from URL
      const fileName = path.basename(doc.url);
      const filePath = path.join(__dirname, '../../uploads', folderName, fileName);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (err) {
          console.warn(`Could not delete file ${filePath}:`, err);
        }
      }
    }

    await doc.destroy();
    res.send({ message: 'Documento eliminado' });
  } catch (e) {
    console.error('Error deleting document:', e);
    res.status(500).send({ error: 'Error al eliminar el documento' });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).send({ error: 'Paciente no encontrado' });

    // Store folder name before deleting from DB
    const folderName = patient.docNumber;

    // 1. Delete from DB (Associations should handle CASCADE for PatientDocuments, Appointments, etc)
    await patient.destroy();

    // 2. Delete physical files (only for local storage)
    const uploadDir = path.join(__dirname, '../../uploads');
    const patientDir = path.join(uploadDir, folderName);
    
    if (fs.existsSync(patientDir)) {
      try {
        fs.rmSync(patientDir, { recursive: true, force: true });
        console.log(`Successfully deleted physical folder for patient ${folderName}`);
      } catch (err) {
        console.error(`Warning: Could not delete physical folder ${patientDir}:`, err);
        // We don't fail the request here because the DB is already clean
      }
    }
    
    res.send({ message: 'Paciente eliminado exitosamente' });
  } catch (e) {
    console.error('SERVER ERROR DELETE PATIENT:', e);
    res.status(500).send({ 
      error: 'Error al eliminar el paciente. Posiblemente tenga registros vinculados.',
      details: e.message 
    });
  }
};

const getPatientDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const doc = await PatientDocument.findByPk(docId);
    
    if (!doc) {
      return res.status(404).send({ error: 'Documento no encontrado' });
    }

    // Determine type for correct response headers
    const contentType = doc.url.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`);

    if (process.env.BUCKET_NAME) {
      // --- MODALIDAD S3 (PRODUCCIÓN) ---
      const s3 = new S3Client({
        region: process.env.REGION || 'us-east-1',
        endpoint: process.env.ENDPOINT,
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });

      // Extract key from URL
      const urlObj = new URL(doc.url);
      const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
      
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: decodeURIComponent(key)
      });

      const s3Response = await s3.send(command);
      s3Response.Body.pipe(res);
    } else {
      // --- MODALIDAD LOCAL (DESARROLLO) ---
      // Convert URL to local path
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const relativePath = doc.url.replace(baseUrl, '').replace('/uploads/', '');
      const localPath = path.join(__dirname, '../../uploads', relativePath);
      
      if (fs.existsSync(localPath)) {
        fs.createReadStream(localPath).pipe(res);
      } else {
        res.status(404).send({ error: 'Archivo local no encontrado' });
      }
    }
  } catch (e) {
    console.error('ERROR VIEWING DOCUMENT:', e);
    if (!res.headersSent) {
      res.status(500).send({ error: 'Error al obtener el documento' });
    }
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  getDocumentTypes,
  uploadPatientDocument,
  deletePatientDocument,
  deletePatient,
  getPatientDocument
};
