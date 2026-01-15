import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CertificateForm from '../components/CertificateForm';
import { birthCertificateAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddCertificate = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(isEdit);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    if (isEdit && id) {
      fetchCertificate();
    }
  }, [isEdit, id]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await birthCertificateAPI.getById(id);
      setCertificate(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'extrait');
      navigate('/birth-certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await birthCertificateAPI.update(id, formData);
        toast.success('Extrait mis à jour avec succès');
      } else {
        await birthCertificateAPI.create(formData);
        toast.success('Extrait créé avec succès');
      }
      navigate('/birth-certificates');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <CertificateForm
      initialData={certificate}
      onSubmit={handleSubmit}
      isEdit={isEdit}
    />
  );
};

export default AddCertificate;
