import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CertificateList from '../components/CertificateList';
import SearchBar from '../components/SearchBar';
import { birthCertificateAPI } from '../services/api';
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

const ViewCertificates = () => {
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
      const response = await birthCertificateAPI.getAll();
      setCertificates(response.data.data);
      setFilteredCertificates(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des extraits');
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
        cert.firstName.toLowerCase().includes(searchTerm) ||
        cert.familyName.toLowerCase().includes(searchTerm) ||
        cert.registryNumber.toLowerCase().includes(searchTerm) ||
        cert.fatherFirstName.toLowerCase().includes(searchTerm) ||
        cert.birthPlace.toLowerCase().includes(searchTerm)
    );
    setFilteredCertificates(filtered);
  };

  const handleEdit = (id) => {
    navigate(`/birth-certificates/${id}`);
  };

  const handleView = (id) => {
    navigate(`/birth-certificates/${id}`);
  };

  const handleDeleteClick = (id, firstName, familyName) => {
    setDeleteDialog({
      open: true,
      certificateId: id,
      certificateName: `${firstName} ${familyName}`,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await birthCertificateAPI.delete(deleteDialog.certificateId);
      toast.success('Extrait supprimé avec succès');
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
    return <div>Chargement des extraits...</div>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestion des extraits de naissance</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-birth-certificate')}
        >
          Nouvel extrait
        </Button>
      </Box>

      <SearchBar onSearch={handleSearch} placeholder="Rechercher par nom, prénom, numéro..." />

      <CertificateList
        certificates={filteredCertificates}
        onEdit={handleEdit}
        onDelete={(id) => {
          const cert = certificates.find((c) => c._id === id);
          if (cert) {
            handleDeleteClick(id, cert.firstName, cert.familyName);
          }
        }}
        onView={handleView}
        type="birth"
      />

      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'extrait de{' '}
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

export default ViewCertificates;
