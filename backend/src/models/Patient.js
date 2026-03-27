const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  docNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isInactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: true
  },
  number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  apartment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  province: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Patient;
