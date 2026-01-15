const mongoose = require('mongoose');

const birthCertificateSchema = new mongoose.Schema({
  registryNumber: {
    type: String,
    required: true,
    unique: true
  },
  year: {
    type: Number,
    required: true
  },
  recordNumber: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  birthTime: {
    type: String,
    required: true
  },
  birthPlace: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['MASCULIN', 'FÉMININ'],
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  fatherFirstName: {
    type: String,
    required: true
  },
  motherFirstName: {
    type: String,
    required: true
  },
  familyName: {
    type: String,
    required: true
  },
  motherFamilyName: {
    type: String,
    required: true
  },
  birthCountry: {
    type: String,
    default: 'SENEGAL'
  },
  marginalNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BirthCertificate', birthCertificateSchema);
