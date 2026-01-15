const DeathCertificate = require('../models/DeathCertificate');
const { parseCSV } = require('../utils/csvParser');
const fs = require('fs');
const path = require('path');

exports.createCertificate = async (req, res) => {
  try {
    const certificate = new DeathCertificate(req.body);
    await certificate.save();
    res.status(201).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await DeathCertificate.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.searchCertificates = async (req, res) => {
  try {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');
    
    const certificates = await DeathCertificate.find({
      $or: [
        { deceasedFirstName: searchRegex },
        { deceasedLastName: searchRegex },
        { registryNumber: searchRegex },
        { recordNumber: searchRegex }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await DeathCertificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificat de décès non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateCertificate = async (req, res) => {
  try {
    const certificate = await DeathCertificate.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificat de décès non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await DeathCertificate.findByIdAndDelete(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificat de décès non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Certificat de décès supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.importFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier uploadé'
      });
    }
    
    const filePath = path.join(__dirname, '../../', req.file.path);
    const certificates = await parseDeathCSV(filePath);
    
    const result = await DeathCertificate.insertMany(certificates, { ordered: false });
    
    fs.unlinkSync(filePath);
    
    res.status(201).json({
      success: true,
      message: `${result.length} certificats de décès importés avec succès`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const parseDeathCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const certificates = [];
    const fs = require('fs');
    const csv = require('csv-parser');
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const certificate = {
          registryNumber: row.NUMERO_REGISTRE || `DEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          year: parseInt(row.ANNEE) || new Date().getFullYear(),
          recordNumber: row.NUMERO_ACTE || '',
          deathDate: new Date(row.DATE_DECES) || new Date(),
          deathTime: row.HEURE_DECES || '00:00',
          deathPlace: row.LIEU_DECES || '',
          deceasedFirstName: row.PRENOM_DECEDE || '',
          deceasedLastName: row.NOM_DECEDE || '',
          deceasedGender: row.SEXE?.toUpperCase() === 'F' ? 'FÉMININ' : 'MASCULIN',
          birthDate: new Date(row.DATE_NAISSANCE) || new Date(),
          birthPlace: row.LIEU_NAISSANCE || '',
          profession: row.PROFESSION || '',
          domicile: row.DOMICILE || '',
          fatherName: row.NOM_PERE || '',
          motherName: row.NOM_MERE || '',
          spouseName: row.NOM_CONJOINT || '',
          deathCause: row.CAUSE_DECES || '',
          declarantName: row.NOM_DECLARANT || '',
          declarantAge: parseInt(row.AGE_DECLARANT) || 0,
          declarantProfession: row.PROFESSION_DECLARANT || '',
          declarantDomicile: row.DOMICILE_DECLARANT || '',
          declarantRelationship: row.LIEN_DECLARANT || '',
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
