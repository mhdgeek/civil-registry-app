import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { birthCertificateAPI, deathCertificateAPI, marriageCertificateAPI } from '../services/api';
import toast from 'react-hot-toast';

const CSVUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Veuillez sélectionner un fichier CSV');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let response;
      switch (activeTab) {
        case 0: // Naissance
          response = await birthCertificateAPI.importCSV(file);
          break;
        case 1: // Décès
          response = await deathCertificateAPI.importCSV(file);
          break;
        case 2: // Mariage
          response = await marriageCertificateAPI.importCSV(file);
          break;
        default:
          throw new Error('Type de certificat non reconnu');
      }
      
      toast.success(response.data.message);
      setFile(null);
      document.getElementById('csv-upload').value = '';
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'importation';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    let template = '';
    
    switch (activeTab) {
      case 0: // Naissance
        template = `NUMERO_REGISTRE,ANNEE,NUMERO_ACTE,DATE_NAISSANCE,HEURE_NAISSANCE,LIEU_NAISSANCE,SEXE,PRENOM,NOM_FAMILLE,PRENOM_PERE,PRENOM_MERE,NOM_FAMILLE_MERE,PAYS_NAISSANCE,MENTIONS_MARGINALES
REG-001,1996,00161,25/06/1996,18:00,THIENABA GARE,M,MOHAMED,NDOYE,MACODE,THIANE,DIOUF,SENEGAL,""
REG-002,1997,00162,15/07/1997,14:30,DAKAR,F,AMINATA,SOW,PAPA,SOKHNA,TOURE,SENEGAL,"Mention 1"`;
        break;
      case 1: // Décès
        template = `NUMERO_REGISTRE,ANNEE,NUMERO_ACTE,DATE_DECES,HEURE_DECES,LIEU_DECES,PRENOM_DECEDE,NOM_DECEDE,SEXE,DATE_NAISSANCE,LIEU_NAISSANCE,PROFESSION,DOMICILE,NOM_PERE,NOM_MERE,NOM_CONJOINT,CAUSE_DECES,NOM_DECLARANT,AGE_DECLARANT,PROFESSION_DECLARANT,DOMICILE_DECLARANT,LIEN_DECLARANT,MENTIONS_MARGINALES
DEC-001,2023,00123,15/03/2023,10:30,HOPITAL_DAKAR,MOHAMED,NDOYE,M,25/06/1996,THIENABA,ENSEIGNANT,DAKAR,PAPA,MAMAN,AISSATOU,CARDIOPATHIE,ALIOU,45,COMMERÇANT,DAKAR,FRERE,""
DEC-002,2023,00124,20/03/2023,14:00,DAKAR,AMINATA,SOW,F,15/07/1997,DAKAR,INFIRMIERE,DAKAR,PAPA,MAMAN,MOHAMED,CANCER,OUSMANE,50,FONCTIONNAIRE,DAKAR,FILS,""`;
        break;
      case 2: // Mariage
        template = `NUMERO_REGISTRE,ANNEE,NUMERO_ACTE,DATE_MARIAGE,HEURE_MARIAGE,LIEU_MARIAGE,PRENOM_EPOUX,NOM_EPOUX,DATE_NAISSANCE_EPOUX,LIEU_NAISSANCE_EPOUX,PROFESSION_EPOUX,DOMICILE_EPOUX,NOM_PERE_EPOUX,NOM_MERE_EPOUX,PRENOM_EPOUSE,NOM_EPOUSE,DATE_NAISSANCE_EPOUSE,LIEU_NAISSANCE_EPOUSE,PROFESSION_EPOUSE,DOMICILE_EPOUSE,NOM_PERE_EPOUSE,NOM_MERE_EPOUSE,NOM_TEMOIN1,AGE_TEMOIN1,PROFESSION_TEMOIN1,DOMICILE_TEMOIN1,NOM_TEMOIN2,AGE_TEMOIN2,PROFESSION_TEMOIN2,DOMICILE_TEMOIN2,NOM_OFFICIER,TITRE_OFFICIER,TYPE_CONTRAT,MENTIONS_MARGINALES
MAR-001,2023,00125,15/04/2023,16:00,MAIRIE_DAKAR,MOHAMED,NDOYE,25/06/1996,THIENABA,ENSEIGNANT,DAKAR,PAPA_NDOYE,MAMAN_NDOYE,AISSATOU,DIOP,15/08/1998,DAKAR,INFIRMIERE,DAKAR,PAPA_DIOP,MAMAN_DIOP,ALIOU,45,COMMERÇANT,DAKAR,OUSMANE,50,FONCTIONNAIRE,DAKAR,M_LE_MAIRE,OFFICIER_ETAT_CIVIL,COMMUNAUTÉ,""
MAR-002,2023,00126,20/04/2023,15:30,MAIRIE_DAKAR,PAPA,SOW,10/05/1995,DAKAR,INGENIEUR,DAKAR,PAPA_SOW,MAMAN_SOW,SOKHNA,TOURE,12/12/1997,DAKAR,ENSEIGNANTE,DAKAR,PAPA_TOURE,MAMAN_TOURE,MAMADOU,40,MEDECIN,DAKAR,FATOU,35,AVOCATE,DAKAR,M_LE_MAIRE,OFFICIER_ETAT_CIVIL,SÉPARATION_DE_BIENS,""`;
        break;
    }
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modele_${activeTab === 0 ? 'naissance' : activeTab === 1 ? 'deces' : 'mariage'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFile(null);
    setError('');
  };

  const getTabLabels = () => {
    return ['Naissance', 'Décès', 'Mariage'];
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Importation depuis CSV
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Sélectionnez le type de certificat, téléchargez le modèle correspondant, 
        remplissez-le avec vos données, puis importez-le.
      </Alert>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {getTabLabels().map((label, index) => (
          <Tab key={index} label={label} />
        ))}
      </Tabs>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={downloadTemplate}
          startIcon={<DownloadIcon />}
        >
          Télécharger le modèle {activeTab === 0 ? 'naissance' : activeTab === 1 ? 'décès' : 'mariage'}
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="csv-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
          >
            Sélectionner le fichier CSV
          </Button>
        </label>
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Fichier sélectionné: {file.name}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {uploading && <LinearProgress sx={{ mb: 2 }} />}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!file || uploading}
        sx={{ mt: 2 }}
      >
        {uploading ? 'Importation en cours...' : 'Importer'}
      </Button>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Instructions:
        </Typography>
        <Typography variant="caption" component="div">
          1. Téléchargez le modèle correspondant au type de certificat
        </Typography>
        <Typography variant="caption" component="div">
          2. Remplissez-le avec vos données
        </Typography>
        <Typography variant="caption" component="div">
          3. Sélectionnez le fichier rempli
        </Typography>
        <Typography variant="caption" component="div">
          4. Cliquez sur "Importer"
        </Typography>
      </Box>
    </Paper>
  );
};

export default CSVUpload;
