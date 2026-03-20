const express = require('express');
const { createAppointment, getAppointments, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createAppointment);
router.get('/', auth, getAppointments);
router.patch('/:id', auth, updateAppointment);
router.delete('/:id', auth, deleteAppointment);

module.exports = router;
