import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MarriageCertificateForm from '../components/MarriageCertificateForm';
import { marriageCertificateAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddMarriageCertificate = ({ isEdit = false }) => {
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
      const response = await marriageCertificateAPI.getById(id);
      setCertificate(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement du certificat de mariage');
      navigate('/marriage-certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await marriageCertificateAPI.update(id, formData);
        toast.success('Certificat de mariage mis à jour avec succès');
      } else {
        await marriageCertificateAPI.create(formData);
        toast.success('Certificat de mariage créé avec succès');
      }
      navigate('/marriage-certificates');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <MarriageCertificateForm
      initialData={certificate}
      onSubmit={handleSubmit}
      isEdit={isEdit}
    />
  );
};

export default AddMarriageCertificate;
