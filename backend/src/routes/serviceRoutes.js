const express = require('express');
const { createService, getServices, updateService } = require('../controllers/serviceController');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, admin, createService);
router.get('/', auth, getServices);
router.patch('/:id', auth, admin, updateService);

module.exports = router;
