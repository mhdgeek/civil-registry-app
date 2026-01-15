const mongoose = require('mongoose');

const marriageCertificateSchema = new mongoose.Schema({
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
  marriageDate: {
    type: Date,
    required: true
  },
  marriageTime: {
    type: String,
    required: true
  },
  marriagePlace: {
    type: String,
    required: true
  },
  
  // Époux
  groomFirstName: {
    type: String,
    required: true
  },
  groomLastName: {
    type: String,
    required: true
  },
  groomBirthDate: {
    type: Date,
    required: true
  },
  groomBirthPlace: {
    type: String,
    required: true
  },
  groomProfession: {
    type: String,
    default: ''
  },
  groomDomicile: {
    type: String,
    required: true
  },
  groomFatherName: {
    type: String,
    required: true
  },
  groomMotherName: {
    type: String,
    required: true
  },
  
  // Épouse
  brideFirstName: {
    type: String,
    required: true
  },
  brideLastName: {
    type: String,
    required: true
  },
  brideBirthDate: {
    type: Date,
    required: true
  },
  brideBirthPlace: {
    type: String,
    required: true
  },
  brideProfession: {
    type: String,
    default: ''
  },
  brideDomicile: {
    type: String,
    required: true
  },
  brideFatherName: {
    type: String,
    required: true
  },
  brideMotherName: {
    type: String,
    required: true
  },
  
  // Témoins
  witness1Name: {
    type: String,
    required: true
  },
  witness1Age: {
    type: Number,
    required: true
  },
  witness1Profession: {
    type: String,
    default: ''
  },
  witness1Domicile: {
    type: String,
    required: true
  },
  
  witness2Name: {
    type: String,
    required: true
  },
  witness2Age: {
    type: Number,
    required: true
  },
  witness2Profession: {
    type: String,
    default: ''
  },
  witness2Domicile: {
    type: String,
    required: true
  },
  
  // Officier d'état civil
  officerName: {
    type: String,
    required: true
  },
  officerTitle: {
    type: String,
    default: 'Officier d\'état civil'
  },
  
  contractType: {
    type: String,
    enum: ['COMMUNAUTÉ', 'SÉPARATION DE BIENS'],
    default: 'COMMUNAUTÉ'
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

module.exports = mongoose.model('MarriageCertificate', marriageCertificateSchema);
