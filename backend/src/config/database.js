const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

let sequelize;

if (dbUrl) {
  // Use PostgreSQL for Production
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Render/Neon etc.
      }
    },
    logging: false
  });
} else {
  // Fallback to SQLite for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '..', process.env.DB_STORAGE || 'database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
