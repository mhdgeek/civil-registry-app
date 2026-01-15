import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Upload as UploadIcon,
  PersonAdd as BirthIcon,
  PersonOff as DeathIcon,
  Favorite as MarriageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Naissance',
      description: 'Gérer les extraits de naissance',
      icon: <BirthIcon sx={{ fontSize: 40 }} />,
      items: [
        { text: 'Nouvel extrait', path: '/add-birth-certificate' },
        { text: 'Liste des extraits', path: '/birth-certificates' },
      ],
      color: '#1976d2',
    },
    {
      title: 'Décès',
      description: 'Gérer les certificats de décès',
      icon: <DeathIcon sx={{ fontSize: 40 }} />,
      items: [
        { text: 'Nouveau certificat', path: '/add-death-certificate' },
        { text: 'Liste des certificats', path: '/death-certificates' },
      ],
      color: '#dc004e',
    },
    {
      title: 'Mariage',
      description: 'Gérer les certificats de mariage',
      icon: <MarriageIcon sx={{ fontSize: 40 }} />,
      items: [
        { text: 'Nouveau certificat', path: '/add-marriage-certificate' },
        { text: 'Liste des certificats', path: '/marriage-certificates' },
      ],
      color: '#9c27b0',
    },
    {
      title: 'Importation',
      description: 'Importer des données depuis CSV',
      icon: <UploadIcon sx={{ fontSize: 40 }} />,
      items: [
        { text: 'Importer CSV', path: '/import' },
      ],
      color: '#ed6c02',
    },
  ];

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenue sur le système de gestion des états civils
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Gérez efficacement tous les types d'actes d'état civil : naissances, décès et mariages.
          Ajoutez de nouveaux actes, importez des données existantes, ou consultez les archives.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent
                sx={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  p: 3,
                }}
              >
                <Box sx={{ color: feature.color }}>{feature.icon}</Box>
                <Typography variant="h6" component="div">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
                
                <Box sx={{ width: '100%', mt: 2 }}>
                  {feature.items.map((item) => (
                    <CardActionArea
                      key={item.text}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => navigate(item.path)}
                    >
                      <Typography variant="body2">
                        {item.text}
                      </Typography>
                    </CardActionArea>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Fonctionnalités principales
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              📝 Gestion complète
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Création, modification, suppression
              <br />
              • Recherche avancée
              <br />
              • Pagination et tri
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="secondary" gutterBottom>
              📁 Import/Export
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Import depuis CSV/Excel
              <br />
              • Modèles téléchargeables
              <br />
              • Export des données
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="success" gutterBottom>
              🎨 Interface moderne
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Design responsive
              <br />
              • Navigation intuitive
              <br />
              • Notifications en temps réel
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default HomePage;
