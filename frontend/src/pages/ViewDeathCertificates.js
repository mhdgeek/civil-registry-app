import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CertificateList from '../components/CertificateList';
import SearchBar from '../components/SearchBar';
import { deathCertificateAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ViewDeathCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    certificateId: null,
    certificateName: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await deathCertificateAPI.getAll();
      setCertificates(response.data.data);
      setFilteredCertificates(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des certificats de décès');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredCertificates(certificates);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = certificates.filter(
      (cert) =>
        cert.deceasedFirstName.toLowerCase().includes(searchTerm) ||
        cert.deceasedLastName.toLowerCase().includes(searchTerm) ||
        cert.registryNumber.toLowerCase().includes(searchTerm) ||
        cert.deathPlace.toLowerCase().includes(searchTerm)
    );
    setFilteredCertificates(filtered);
  };

  const handleEdit = (id) => {
    navigate(`/death-certificates/${id}`);
  };

  const handleView = (id) => {
    navigate(`/death-certificates/${id}`);
  };

  const handleDeleteClick = (id, firstName, lastName) => {
    setDeleteDialog({
      open: true,
      certificateId: id,
      certificateName: `${firstName} ${lastName}`,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deathCertificateAPI.delete(deleteDialog.certificateId);
      toast.success('Certificat de décès supprimé avec succès');
      fetchCertificates();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteDialog({ open: false, certificateId: null, certificateName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, certificateId: null, certificateName: '' });
  };

  if (loading) {
    return <div>Chargement des certificats de décès...</div>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestion des certificats de décès</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-death-certificate')}
        >
          Nouveau certificat
        </Button>
      </Box>

      <SearchBar onSearch={handleSearch} placeholder="Rechercher par nom, prénom..." />

      <CertificateList
  certificates={filteredCertificates}
  onEdit={handleEdit}
  onDelete={(id) => {
    const cert = certificates.find((c) => c._id === id);
    if (cert) {
      handleDeleteClick(id, cert.deceasedFirstName, cert.deceasedLastName);
    }
  }}
  onView={handleView}
  type="death"  // Ajoutez cette ligne
/>

      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le certificat de décès de{' '}
            <strong>{deleteDialog.certificateName}</strong> ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewDeathCertificates;
