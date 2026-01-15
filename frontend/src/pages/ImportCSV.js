import React from 'react';
import CSVUpload from '../components/CSVUpload';
import {
  Paper,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ImportCSV = () => {
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Importation de données
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Importez vos données d'extraits de naissance depuis un fichier CSV.
          Cette fonctionnalité vous permet de migrer vos données existantes
          depuis Excel ou d'autres systèmes.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Conseil :</strong> Téléchargez d'abord le modèle CSV pour
          comprendre le format attendu, puis remplissez-le avec vos données.
        </Alert>

        <Typography variant="h6" gutterBottom>
          Étapes à suivre :
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Téléchargez le modèle CSV" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Remplissez-le avec vos données" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Sélectionnez le fichier rempli" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Importez les données" />
          </ListItem>
        </List>
      </Paper>

      <CSVUpload />
    </Box>
  );
};

export default ImportCSV;
