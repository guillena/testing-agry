const express = require('express');
const { 
  createPatient, getPatients, getPatient, updatePatient, 
  getDocumentTypes, uploadPatientDocument, deletePatientDocument, 
  deletePatient, getPatientDocument 
} = require('../controllers/patientController');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', auth, createPatient);
router.get('/', auth, getPatients);
router.get('/document-types', auth, getDocumentTypes);
router.get('/:id', auth, getPatient);
router.patch('/:id', auth, updatePatient);
router.delete('/:id', auth, isAdmin, deletePatient);

// Document handling endpoints
router.post('/:id/documents', auth, upload.single('file'), uploadPatientDocument);
router.delete('/:id/documents/:docId', auth, deletePatientDocument);
router.get('/document/:docId/view', auth, getPatientDocument);

module.exports = router;
