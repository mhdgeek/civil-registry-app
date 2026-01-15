const mongoose = require('mongoose');

const deathCertificateSchema = new mongoose.Schema({
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
  deathDate: {
    type: Date,
    required: true
  },
  deathTime: {
    type: String,
    required: true
  },
  deathPlace: {
    type: String,
    required: true
  },
  deceasedFirstName: {
    type: String,
    required: true
  },
  deceasedLastName: {
    type: String,
    required: true
  },
  deceasedGender: {
    type: String,
    enum: ['MASCULIN', 'FÉMININ'],
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  birthPlace: {
    type: String,
    required: true
  },
  profession: {
    type: String,
    default: ''
  },
  domicile: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    default: ''
  },
  motherName: {
    type: String,
    default: ''
  },
  spouseName: {
    type: String,
    default: ''
  },
  deathCause: {
    type: String,
    default: ''
  },
  declarantName: {
    type: String,
    required: true
  },
  declarantAge: {
    type: Number,
    required: true
  },
  declarantProfession: {
    type: String,
    default: ''
  },
  declarantDomicile: {
    type: String,
    required: true
  },
  declarantRelationship: {
    type: String,
    default: ''
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

module.exports = mongoose.model('DeathCertificate', deathCertificateSchema);
