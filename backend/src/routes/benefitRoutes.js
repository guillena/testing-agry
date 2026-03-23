const express = require('express');
const { getBenefits, createBenefit, updateBenefit, deleteBenefit } = require('../controllers/benefitController');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getBenefits);
router.post('/', auth, isAdmin, createBenefit);
router.patch('/:id', auth, isAdmin, updateBenefit);
router.delete('/:id', auth, isAdmin, deleteBenefit);

module.exports = router;
