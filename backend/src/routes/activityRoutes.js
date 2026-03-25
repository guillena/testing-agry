const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const activityController = require('../controllers/activityController');

router.post('/', auth, activityController.createActivity);
router.get('/patient/:patientId', auth, activityController.getPatientActivities);

module.exports = router;
