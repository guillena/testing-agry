const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Benefit = sequelize.define('Benefit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Prestaciones'
});

module.exports = Benefit;
