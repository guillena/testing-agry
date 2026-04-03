const express = require('express');
const { createProfessional, getProfessionals, updateProfessional, deleteProfessional } = require('../controllers/professionalController');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, isAdmin, createProfessional);
router.get('/', auth, isAdmin, getProfessionals);
router.patch('/:id', auth, isAdmin, updateProfessional);
router.delete('/:id', auth, isAdmin, deleteProfessional);

module.exports = router;
