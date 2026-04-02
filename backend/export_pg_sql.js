const { Sequelize } = require('sequelize');
const fs = require('fs');

const sequelize = new Sequelize('postgres://dummy:dummy@localhost:5432/dummy', {
  dialect: 'postgres',
  logging: (msg) => {
    if (msg.startsWith('Executing (default): ')) {
      let sql = msg.replace('Executing (default): ', '');
      fs.appendFileSync('schema_postgres.sql', sql + '\n');
    }
  }
});

sequelize.queryInterface.QueryGenerator.dialect = 'postgres';

const Benefit = require('./src/models/Benefit');
const DocumentType = require('./src/models/DocumentType');
const Professional = require('./src/models/Professional');
const Patient = require('./src/models/Patient');
const Appointment = require('./src/models/Appointment');
const ProfessionalBenefits = require('./src/models/ProfessionalBenefits');
const Activity = require('./src/models/Activity');
const PatientDocument = require('./src/models/PatientDocument');

const models = { Benefit, DocumentType, Professional, Patient, Appointment, ProfessionalBenefits, Activity, PatientDocument };
Object.values(models).forEach(m => m.init(sequelize));

// Associations
Professional.belongsToMany(Benefit, { 
  through: ProfessionalBenefits, 
  foreignKey: { name: 'ProfessionalId', allowNull: false, unique: false },
  otherKey: { name: 'BenefitId', allowNull: false, unique: false }
});
Benefit.belongsToMany(Professional, { 
  through: ProfessionalBenefits, 
  foreignKey: { name: 'BenefitId', allowNull: false, unique: false },
  otherKey: { name: 'ProfessionalId', allowNull: false, unique: false }
});
DocumentType.hasMany(Patient, { foreignKey: 'docTypeId' });
Patient.belongsTo(DocumentType, { foreignKey: 'docTypeId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
Professional.hasMany(Appointment, { foreignKey: 'professionalId' });
Appointment.belongsTo(Professional, { foreignKey: 'professionalId' });
Benefit.hasMany(Appointment, { foreignKey: 'benefitId', onDelete: 'CASCADE' });
Appointment.belongsTo(Benefit, { foreignKey: 'benefitId' });
Patient.hasMany(Activity, { foreignKey: 'patientId', onDelete: 'CASCADE' });
Activity.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(PatientDocument, { foreignKey: 'patientId', onDelete: 'CASCADE' });
PatientDocument.belongsTo(Patient, { foreignKey: 'patientId' });
Professional.hasMany(Activity, { foreignKey: 'professionalId' });
Activity.belongsTo(Professional, { foreignKey: 'professionalId' });

async function run() {
  if (fs.existsSync('schema_postgres.sql')) {
    fs.unlinkSync('schema_postgres.sql');
  }
  try {
    const rawSql = [];
    for (const model of Object.values(models)) {
        const sqlDump = await sequelize.queryInterface.QueryGenerator.createTableQuery(model.tableName, sequelize.queryInterface.QueryGenerator.attributesToSQL(model.getAttributes(), {context: 'createTable'}), {});
        rawSql.push(sqlDump);
    }
    fs.writeFileSync('schema_postgres.sql', rawSql.join('\n'));
    console.log('DONE SQL EXPORT');
  } catch(e) {
    console.error(e);
  }
}
run();
