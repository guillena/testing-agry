const sequelize = require('../config/database');
const Service = require('./Service');
const DocumentType = require('./DocumentType');
const Professional = require('./Professional');
const Patient = require('./Patient');
const Appointment = require('./Appointment');

// Associations

// Professional <-> Service (Many-to-Many)
Professional.belongsToMany(Service, { through: 'ProfessionalServices' });
Service.belongsToMany(Professional, { through: 'ProfessionalServices' });

// DocumentType -> Patient (One-to-Many)
DocumentType.hasMany(Patient, { foreignKey: 'docTypeId' });
Patient.belongsTo(DocumentType, { foreignKey: 'docTypeId' });

// Patient -> Appointment (One-to-Many)
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

// Professional -> Appointment (One-to-Many)
Professional.hasMany(Appointment, { foreignKey: 'professionalId' });
Appointment.belongsTo(Professional, { foreignKey: 'professionalId' });

// Service -> Appointment (One-to-Many)
Service.hasMany(Appointment, { foreignKey: 'serviceId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = {
  sequelize,
  Service,
  DocumentType,
  Professional,
  Patient,
  Appointment
};
