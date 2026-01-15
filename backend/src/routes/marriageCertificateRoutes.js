const express = require('express');
const router = express.Router();
const marriageCertificateController = require('../controllers/marriageCertificateController');
const upload = require('../middleware/upload');

router.post('/marriage-certificates', marriageCertificateController.createCertificate);
router.get('/marriage-certificates', marriageCertificateController.getAllCertificates);
router.get('/marriage-certificates/search', marriageCertificateController.searchCertificates);
router.get('/marriage-certificates/:id', marriageCertificateController.getCertificateById);
router.put('/marriage-certificates/:id', marriageCertificateController.updateCertificate);
router.delete('/marriage-certificates/:id', marriageCertificateController.deleteCertificate);
router.post('/marriage-certificates/import', upload.single('file'), marriageCertificateController.importFromCSV);

module.exports = router;
