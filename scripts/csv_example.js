const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'oracle',
  host: process.env.ORACLE_DB_HOST,
  port: process.env.ORACLE_DB_PORT,
  username: process.env.ORACLE_DB_USER,
  password: process.env.ORACLE_DB_PASSWORD,
  database: process.env.ORACLE_DB_DATABASE,
  logging: false
});

const FieldsOfStudy = sequelize.define('D_FIELDS_OF_STUDY', {
  FIELD_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  FIELD_NAME: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'D_FIELDS_OF_STUDY',
  timestamps: false
});

async function insertFieldsOfStudyFromCSV() {
  try {
    // Authenticate the connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const records = [];

    // Read CSV data
    await new Promise((resolve, reject) => {
      fs.createReadStream('./data/fields_of_study_data.csv')
        .pipe(csv())
        .on('data', (row) => {
          if (row.FIELD_NAME) {
            records.push({ FIELD_NAME: row.FIELD_NAME.trim() });
          }
        })
        .on('end', () => {
          console.log('CSV file successfully processed.');
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });

    if (records.length === 0) {
      console.warn('No valid records found in the CSV. Make sure FIELD_NAME column is present.');
      return;
    }

    // Insert data into the database
    for (const record of records) {
      await FieldsOfStudy.create(record);
    }

    console.log('Data inserted successfully!');
  } catch (error) {
    console.error('Error inserting data into D_FIELDS_OF_STUDY:', error);
  } finally {
    // Close the database connection when done
    await sequelize.close();
  }
}

insertFieldsOfStudyFromCSV();
