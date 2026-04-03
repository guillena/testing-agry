const express = require('express');
const { 
  createAppointment, getAppointments, updateAppointment, 
  deleteAppointment, getPatientAppointments 
} = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createAppointment);
router.get('/', auth, getAppointments);
router.get('/patient/:patientId', auth, getPatientAppointments);
router.patch('/:id', auth, updateAppointment);
router.delete('/:id', auth, deleteAppointment);

module.exports = router;
