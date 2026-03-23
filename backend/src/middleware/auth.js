const jwt = require('jsonwebtoken');
const Professional = require('../models/Professional');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const professional = await Professional.findOne({ where: { id: decoded.id } });

    if (!professional) {
      throw new Error();
    }

    req.token = token;
    req.professional = professional;
    console.log('AUTH SUCCESS. Body received:', req.body);
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.professional.role !== 'admin') {
    return res.status(403).send({ error: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = { auth, isAdmin };
