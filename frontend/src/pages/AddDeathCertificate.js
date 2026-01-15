import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DeathCertificateForm from '../components/DeathCertificateForm';
import { deathCertificateAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddDeathCertificate = ({ isEdit = false }) => {
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
      const response = await deathCertificateAPI.getById(id);
      setCertificate(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement du certificat de décès');
      navigate('/death-certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await deathCertificateAPI.update(id, formData);
        toast.success('Certificat de décès mis à jour avec succès');
      } else {
        await deathCertificateAPI.create(formData);
        toast.success('Certificat de décès créé avec succès');
      }
      navigate('/death-certificates');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <DeathCertificateForm
      initialData={certificate}
      onSubmit={handleSubmit}
      isEdit={isEdit}
    />
  );
};

export default AddDeathCertificate;
