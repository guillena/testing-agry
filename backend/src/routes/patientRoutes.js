const express = require('express');
const { createPatient, getPatients, getPatient, updatePatient, getDocumentTypes, uploadPatientDocument, deletePatientDocument } = require('../controllers/patientController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', auth, createPatient);
router.get('/', auth, getPatients);
router.get('/document-types', auth, getDocumentTypes);
router.get('/:id', auth, getPatient);
router.patch('/:id', auth, updatePatient);

// Document handling endpoints
router.post('/:id/documents', auth, upload.single('file'), uploadPatientDocument);
router.delete('/:id/documents/:docId', auth, deletePatientDocument);

module.exports = router;
