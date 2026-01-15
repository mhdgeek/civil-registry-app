const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const upload = require('../middleware/upload');

router.post('/certificates', certificateController.createCertificate);
router.get('/certificates', certificateController.getAllCertificates);
router.get('/certificates/search', certificateController.searchCertificates);
router.get('/certificates/:id', certificateController.getCertificateById);
router.put('/certificates/:id', certificateController.updateCertificate);
router.delete('/certificates/:id', certificateController.deleteCertificate);
router.post('/certificates/import', upload.single('file'), certificateController.importFromCSV);

module.exports = router;
