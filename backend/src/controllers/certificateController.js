const BirthCertificate = require('../models/BirthCertificate');
const { parseCSV } = require('../utils/csvParser');
const fs = require('fs');
const path = require('path');

exports.createCertificate = async (req, res) => {
  try {
    const certificate = new BirthCertificate(req.body);
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
    const certificates = await BirthCertificate.find().sort({ createdAt: -1 });
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
    
    const certificates = await BirthCertificate.find({
      $or: [
        { firstName: searchRegex },
        { familyName: searchRegex },
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
    const certificate = await BirthCertificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Extrait non trouvé'
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
    const certificate = await BirthCertificate.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Extrait non trouvé'
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
    const certificate = await BirthCertificate.findByIdAndDelete(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Extrait non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Extrait supprimé avec succès'
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
    const certificates = await parseCSV(filePath);
    
    const result = await BirthCertificate.insertMany(certificates, { ordered: false });
    
    fs.unlinkSync(filePath);
    
    res.status(201).json({
      success: true,
      message: `${result.length} extraits importés avec succès`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
