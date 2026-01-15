const MarriageCertificate = require('../models/MarriageCertificate');
const { parseCSV } = require('../utils/csvParser');
const fs = require('fs');
const path = require('path');

exports.createCertificate = async (req, res) => {
  try {
    const certificate = new MarriageCertificate(req.body);
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
    const certificates = await MarriageCertificate.find().sort({ createdAt: -1 });
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
    
    const certificates = await MarriageCertificate.find({
      $or: [
        { groomFirstName: searchRegex },
        { groomLastName: searchRegex },
        { brideFirstName: searchRegex },
        { brideLastName: searchRegex },
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
    const certificate = await MarriageCertificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificat de mariage non trouvé'
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
    const certificate = await MarriageCertificate.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificat de mariage non trouvé'
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
    const certificate = await MarriageCertificate.findByIdAndDelete(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificat de mariage non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Certificat de mariage supprimé avec succès'
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
    const certificates = await parseMarriageCSV(filePath);
    
    const result = await MarriageCertificate.insertMany(certificates, { ordered: false });
    
    fs.unlinkSync(filePath);
    
    res.status(201).json({
      success: true,
      message: `${result.length} certificats de mariage importés avec succès`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const parseMarriageCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const certificates = [];
    const fs = require('fs');
    const csv = require('csv-parser');
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const certificate = {
          registryNumber: row.NUMERO_REGISTRE || `MAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          year: parseInt(row.ANNEE) || new Date().getFullYear(),
          recordNumber: row.NUMERO_ACTE || '',
          marriageDate: new Date(row.DATE_MARIAGE) || new Date(),
          marriageTime: row.HEURE_MARIAGE || '00:00',
          marriagePlace: row.LIEU_MARIAGE || '',
          
          groomFirstName: row.PRENOM_EPOUX || '',
          groomLastName: row.NOM_EPOUX || '',
          groomBirthDate: new Date(row.DATE_NAISSANCE_EPOUX) || new Date(),
          groomBirthPlace: row.LIEU_NAISSANCE_EPOUX || '',
          groomProfession: row.PROFESSION_EPOUX || '',
          groomDomicile: row.DOMICILE_EPOUX || '',
          groomFatherName: row.NOM_PERE_EPOUX || '',
          groomMotherName: row.NOM_MERE_EPOUX || '',
          
          brideFirstName: row.PRENOM_EPOUSE || '',
          brideLastName: row.NOM_EPOUSE || '',
          brideBirthDate: new Date(row.DATE_NAISSANCE_EPOUSE) || new Date(),
          brideBirthPlace: row.LIEU_NAISSANCE_EPOUSE || '',
          brideProfession: row.PROFESSION_EPOUSE || '',
          brideDomicile: row.DOMICILE_EPOUSE || '',
          brideFatherName: row.NOM_PERE_EPOUSE || '',
          brideMotherName: row.NOM_MERE_EPOUSE || '',
          
          witness1Name: row.NOM_TEMOIN1 || '',
          witness1Age: parseInt(row.AGE_TEMOIN1) || 0,
          witness1Profession: row.PROFESSION_TEMOIN1 || '',
          witness1Domicile: row.DOMICILE_TEMOIN1 || '',
          
          witness2Name: row.NOM_TEMOIN2 || '',
          witness2Age: parseInt(row.AGE_TEMOIN2) || 0,
          witness2Profession: row.PROFESSION_TEMOIN2 || '',
          witness2Domicile: row.DOMICILE_TEMOIN2 || '',
          
          officerName: row.NOM_OFFICIER || '',
          officerTitle: row.TITRE_OFFICIER || 'Officier d\'état civil',
          
          contractType: row.TYPE_CONTRAT || 'COMMUNAUTÉ',
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
