const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProfessionalBenefits = sequelize.define('ProfessionalBenefits', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ProfessionalId: {
    type: DataTypes.UUID,
    references: { model: 'Professionals', key: 'id' },
    unique: false,
    allowNull: false
  },
  BenefitId: {
    type: DataTypes.UUID,
    references: { model: 'Prestaciones', key: 'id' },
    unique: false,
    allowNull: false
  }
}, {
  tableName: 'ProfessionalBenefits',
  indexes: [
    {
      unique: true,
      fields: ['ProfessionalId', 'BenefitId']
    }
  ]
});

module.exports = ProfessionalBenefits;
