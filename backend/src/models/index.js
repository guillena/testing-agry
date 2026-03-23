const sequelize = require('../config/database');
const Benefit = require('./Benefit');
const DocumentType = require('./DocumentType');
const Professional = require('./Professional');
const Patient = require('./Patient');
const Appointment = require('./Appointment');

// Associations

// Professional <-> Benefit (Many-to-Many)
Professional.belongsToMany(Benefit, { through: 'ProfessionalBenefits' });
Benefit.belongsToMany(Professional, { through: 'ProfessionalBenefits' });

// DocumentType -> Patient (One-to-Many)
DocumentType.hasMany(Patient, { foreignKey: 'docTypeId' });
Patient.belongsTo(DocumentType, { foreignKey: 'docTypeId' });

// Patient -> Appointment (One-to-Many)
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

// Professional -> Appointment (One-to-Many)
Professional.hasMany(Appointment, { foreignKey: 'professionalId' });
Appointment.belongsTo(Professional, { foreignKey: 'professionalId' });

// Benefit -> Appointment (One-to-Many)
Benefit.hasMany(Appointment, { foreignKey: 'benefitId' });
Appointment.belongsTo(Benefit, { foreignKey: 'benefitId' });

module.exports = {
  sequelize,
  Benefit,
  DocumentType,
  Professional,
  Patient,
  Appointment
};
