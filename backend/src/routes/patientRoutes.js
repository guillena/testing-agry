const express = require('express');
const { createPatient, getPatients, getPatient, updatePatient, getDocumentTypes } = require('../controllers/patientController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createPatient);
router.get('/', auth, getPatients);
router.get('/document-types', auth, getDocumentTypes);
router.get('/:id', auth, getPatient);
router.patch('/:id', auth, updatePatient);

module.exports = router;
