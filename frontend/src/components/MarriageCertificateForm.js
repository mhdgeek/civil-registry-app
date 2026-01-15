import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

const MarriageCertificateForm = ({ initialData, onSubmit, isEdit }) => {
  const [formData, setFormData] = useState({
    registryNumber: '',
    year: new Date().getFullYear(),
    recordNumber: '',
    marriageDate: new Date(),
    marriageTime: '00:00',
    marriagePlace: '',
    
    groomFirstName: '',
    groomLastName: '',
    groomBirthDate: new Date(),
    groomBirthPlace: '',
    groomProfession: '',
    groomDomicile: '',
    groomFatherName: '',
    groomMotherName: '',
    
    brideFirstName: '',
    brideLastName: '',
    brideBirthDate: new Date(),
    brideBirthPlace: '',
    brideProfession: '',
    brideDomicile: '',
    brideFatherName: '',
    brideMotherName: '',
    
    witness1Name: '',
    witness1Age: 0,
    witness1Profession: '',
    witness1Domicile: '',
    
    witness2Name: '',
    witness2Age: 0,
    witness2Profession: '',
    witness2Domicile: '',
    
    officerName: '',
    officerTitle: 'Officier d\'état civil',
    
    contractType: 'COMMUNAUTÉ',
    marginalNotes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        marriageDate: new Date(initialData.marriageDate),
        groomBirthDate: new Date(initialData.groomBirthDate),
        brideBirthDate: new Date(initialData.brideBirthDate),
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
      year: field === 'marriageDate' ? date.getFullYear() : prev.year,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Modifier le certificat de mariage' : 'Nouveau certificat de mariage'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Grid container spacing={2}>
            {/* Informations du certificat */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Informations du mariage
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
                label="Date du mariage"
                value={formData.marriageDate}
                onChange={(date) => handleDateChange(date, 'marriageDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Heure du mariage"
                name="marriageTime"
                type="time"
                value={formData.marriageTime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lieu du mariage"
                name="marriagePlace"
                value={formData.marriagePlace}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Époux */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Informations de l'époux
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom de l'époux"
                name="groomFirstName"
                value={formData.groomFirstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'époux"
                name="groomLastName"
                value={formData.groomLastName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date de naissance"
                value={formData.groomBirthDate}
                onChange={(date) => handleDateChange(date, 'groomBirthDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lieu de naissance"
                name="groomBirthPlace"
                value={formData.groomBirthPlace}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profession"
                name="groomProfession"
                value={formData.groomProfession}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Domicile"
                name="groomDomicile"
                value={formData.groomDomicile}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du père"
                name="groomFatherName"
                value={formData.groomFatherName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de la mère"
                name="groomMotherName"
                value={formData.groomMotherName}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Épouse */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main' }}>
                Informations de l'épouse
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom de l'épouse"
                name="brideFirstName"
                value={formData.brideFirstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'épouse"
                name="brideLastName"
                value={formData.brideLastName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date de naissance"
                value={formData.brideBirthDate}
                onChange={(date) => handleDateChange(date, 'brideBirthDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lieu de naissance"
                name="brideBirthPlace"
                value={formData.brideBirthPlace}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profession"
                name="brideProfession"
                value={formData.brideProfession}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Domicile"
                name="brideDomicile"
                value={formData.brideDomicile}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du père"
                name="brideFatherName"
                value={formData.brideFatherName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de la mère"
                name="brideMotherName"
                value={formData.brideMotherName}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Témoins */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                Témoins
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Premier témoin
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du témoin"
                name="witness1Name"
                value={formData.witness1Name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Âge"
                name="witness1Age"
                type="number"
                value={formData.witness1Age}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profession"
                name="witness1Profession"
                value={formData.witness1Profession}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Domicile"
                name="witness1Domicile"
                value={formData.witness1Domicile}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Second témoin
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du témoin"
                name="witness2Name"
                value={formData.witness2Name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Âge"
                name="witness2Age"
                type="number"
                value={formData.witness2Age}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profession"
                name="witness2Profession"
                value={formData.witness2Profession}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Domicile"
                name="witness2Domicile"
                value={formData.witness2Domicile}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Officier d'état civil */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                Officier d'état civil
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'officier"
                name="officerName"
                value={formData.officerName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Titre"
                name="officerTitle"
                value={formData.officerTitle}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Régime matrimonial"
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
              >
                <MenuItem value="COMMUNAUTÉ">Communauté de biens</MenuItem>
                <MenuItem value="SÉPARATION DE BIENS">Séparation de biens</MenuItem>
              </TextField>
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

export default MarriageCertificateForm;
