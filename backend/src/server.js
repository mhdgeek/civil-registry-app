const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const birthCertificateRoutes = require('./routes/certificateRoutes');
const deathCertificateRoutes = require('./routes/deathCertificateRoutes');
const marriageCertificateRoutes = require('./routes/marriageCertificateRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/api', birthCertificateRoutes);
app.use('/api', deathCertificateRoutes);
app.use('/api', marriageCertificateRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API de gestion des états civils',
    endpoints: {
      birth: '/api/certificates',
      death: '/api/death-certificates',
      marriage: '/api/marriage-certificates'
    }
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
