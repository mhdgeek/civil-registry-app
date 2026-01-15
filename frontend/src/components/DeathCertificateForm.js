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

const DeathCertificateForm = ({ initialData, onSubmit, isEdit }) => {
  const [formData, setFormData] = useState({
    registryNumber: '',
    year: new Date().getFullYear(),
    recordNumber: '',
    deathDate: new Date(),
    deathTime: '00:00',
    deathPlace: '',
    deceasedFirstName: '',
    deceasedLastName: '',
    deceasedGender: 'MASCULIN',
    birthDate: new Date(),
    birthPlace: '',
    profession: '',
    domicile: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    deathCause: '',
    declarantName: '',
    declarantAge: 0,
    declarantProfession: '',
    declarantDomicile: '',
    declarantRelationship: '',
    marginalNotes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        deathDate: new Date(initialData.deathDate),
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

  const handleDateChange = (date, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
      year: field === 'deathDate' ? date.getFullYear() : prev.year,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Modifier le certificat de décès' : 'Nouveau certificat de décès'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Grid container spacing={2}>
            {/* Informations du certificat */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Informations du certificat
              </Typography>
            </Grid>
            
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
                label="Date du décès"
                value={formData.deathDate}
                onChange={(date) => handleDateChange(date, 'deathDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Heure du décès"
                name="deathTime"
                type="time"
                value={formData.deathTime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lieu du décès"
                name="deathPlace"
                value={formData.deathPlace}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Informations du défunt */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2, color: 'primary.main' }}>
                Informations du défunt
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom du défunt"
                name="deceasedFirstName"
                value={formData.deceasedFirstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du défunt"
                name="deceasedLastName"
                value={formData.deceasedLastName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Sexe"
                name="deceasedGender"
                value={formData.deceasedGender}
                onChange={handleChange}
                required
              >
                <MenuItem value="MASCULIN">Masculin</MenuItem>
                <MenuItem value="FÉMININ">Féminin</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date de naissance"
                value={formData.birthDate}
                onChange={(date) => handleDateChange(date, 'birthDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
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
                label="Profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dernier domicile"
                name="domicile"
                value={formData.domicile}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du père"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de la mère"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du conjoint"
                name="spouseName"
                value={formData.spouseName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cause du décès"
                name="deathCause"
                value={formData.deathCause}
                onChange={handleChange}
              />
            </Grid>

            {/* Informations du déclarant */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2, color: 'primary.main' }}>
                Informations du déclarant
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du déclarant"
                name="declarantName"
                value={formData.declarantName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Âge du déclarant"
                name="declarantAge"
                type="number"
                value={formData.declarantAge}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profession du déclarant"
                name="declarantProfession"
                value={formData.declarantProfession}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Domicile du déclarant"
                name="declarantDomicile"
                value={formData.declarantDomicile}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lien avec le défunt"
                name="declarantRelationship"
                value={formData.declarantRelationship}
                onChange={handleChange}
              />
            </Grid>

            {/* Mentions marginales */}
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
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

export default DeathCertificateForm;
