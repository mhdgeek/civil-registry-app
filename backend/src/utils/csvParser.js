const csv = require('csv-parser');
const fs = require('fs');
const BirthCertificate = require('../models/BirthCertificate');

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const certificates = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const certificate = {
          registryNumber: row.NUMERO_REGISTRE || `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          year: parseInt(row.ANNEE) || new Date().getFullYear(),
          recordNumber: row.NUMERO_ACTE || '',
          birthDate: new Date(row.DATE_NAISSANCE) || new Date(),
          birthTime: row.HEURE_NAISSANCE || '00:00',
          birthPlace: row.LIEU_NAISSANCE || '',
          gender: row.SEXE?.toUpperCase() === 'F' ? 'FÉMININ' : 'MASCULIN',
          firstName: row.PRENOM || '',
          fatherFirstName: row.PRENOM_PERE || '',
          motherFirstName: row.PRENOM_MERE || '',
          familyName: row.NOM_FAMILLE || '',
          motherFamilyName: row.NOM_FAMILLE_MERE || '',
          birthCountry: row.PAYS_NAISSANCE || 'SENEGAL',
          marginalNotes: row.MENTIONS_MARGINALES || ''
        };
        certificates.push(certificate);
      })
      .on('end', () => {
        resolve(certificates);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

module.exports = { parseCSV };
