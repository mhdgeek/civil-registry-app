const express = require('express');
const router = express.Router();
const deathCertificateController = require('../controllers/deathCertificateController');
const upload = require('../middleware/upload');

router.post('/death-certificates', deathCertificateController.createCertificate);
router.get('/death-certificates', deathCertificateController.getAllCertificates);
router.get('/death-certificates/search', deathCertificateController.searchCertificates);
router.get('/death-certificates/:id', deathCertificateController.getCertificateById);
router.put('/death-certificates/:id', deathCertificateController.updateCertificate);
router.delete('/death-certificates/:id', deathCertificateController.deleteCertificate);
router.post('/death-certificates/import', upload.single('file'), deathCertificateController.importFromCSV);

module.exports = router;
