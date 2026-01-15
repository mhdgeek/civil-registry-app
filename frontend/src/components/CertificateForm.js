import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

const CertificateForm = ({ initialData, onSubmit, isEdit }) => {
  const [formData, setFormData] = useState({
    registryNumber: '',
    year: new Date().getFullYear(),
    recordNumber: '',
    birthDate: new Date(),
    birthTime: '00:00',
    birthPlace: '',
    gender: 'MASCULIN',
    firstName: '',
    fatherFirstName: '',
    motherFirstName: '',
    familyName: '',
    motherFamilyName: '',
    birthCountry: 'SENEGAL',
    marginalNotes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        birthDate: new Date(initialData.birthDate),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      birthDate: date,
      year: date.getFullYear(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Modifier l\'extrait' : 'Nouvel extrait de naissance'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Numéro de registre"
                name="registryNumber"
                value={formData.registryNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Année"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Numéro d'acte"
                name="recordNumber"
                value={formData.recordNumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date de naissance"
                value={formData.birthDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Heure de naissance"
                name="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lieu de naissance"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Sexe"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="MASCULIN">Masculin</MenuItem>
                <MenuItem value="FÉMININ">Féminin</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de famille"
                name="familyName"
                value={formData.familyName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom du père"
                name="fatherFirstName"
                value={formData.fatherFirstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom de la mère"
                name="motherFirstName"
                value={formData.motherFirstName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de famille de la mère"
                name="motherFamilyName"
                value={formData.motherFamilyName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pays de naissance"
                name="birthCountry"
                value={formData.birthCountry}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mentions marginales"
                name="marginalNotes"
                value={formData.marginalNotes}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => window.history.back()}>
                  Annuler
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {isEdit ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </form>
    </Paper>
  );
};

export default CertificateForm;
