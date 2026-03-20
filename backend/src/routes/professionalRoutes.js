const express = require('express');
const { createProfessional, getProfessionals, updateProfessional } = require('../controllers/professionalController');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, admin, createProfessional);
router.get('/', auth, admin, getProfessionals);
router.patch('/:id', auth, admin, updateProfessional);

module.exports = router;
