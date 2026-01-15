import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CertificateList = ({ certificates, onEdit, onDelete, onView, type = 'birth' }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedCertificates = certificates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getHeaders = () => {
    switch (type) {
      case 'death':
        return ['Numéro Registre', 'Défunt', 'Date Décès', 'Lieu', 'Âge', 'Actions'];
      case 'marriage':
        return ['Numéro Registre', 'Époux', 'Épouse', 'Date Mariage', 'Lieu', 'Actions'];
      default:
        return ['Numéro Registre', 'Nom Complet', 'Date Naissance', 'Lieu', 'Sexe', 'Actions'];
    }
  };

  const renderRow = (certificate) => {
    switch (type) {
      case 'death':
        return (
          <TableRow key={certificate._id} hover>
            <TableCell>
              <Box>
                <Typography variant="body2">
                  {certificate.registryNumber}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Acte: {certificate.recordNumber}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Typography variant="body1">
                  {certificate.deceasedFirstName} {certificate.deceasedLastName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Né(e) le: {format(new Date(certificate.birthDate), 'dd/MM/yyyy', { locale: fr })}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Typography variant="body2">
                  {format(new Date(certificate.deathDate), 'dd/MM/yyyy', { locale: fr })}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {certificate.deathTime}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>{certificate.deathPlace}</TableCell>
            <TableCell>
              {Math.floor((new Date(certificate.deathDate) - new Date(certificate.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))} ans
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" color="info" onClick={() => onView(certificate._id)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="primary" onClick={() => onEdit(certificate._id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDelete(certificate._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        );
      
      case 'marriage':
        return (
          <TableRow key={certificate._id} hover>
            <TableCell>
              <Box>
                <Typography variant="body2">
                  {certificate.registryNumber}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Acte: {certificate.recordNumber}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body1">
                {certificate.groomFirstName} {certificate.groomLastName}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body1">
                {certificate.brideFirstName} {certificate.brideLastName}
              </Typography>
            </TableCell>
            <TableCell>
              <Box>
                <Typography variant="body2">
                  {format(new Date(certificate.marriageDate), 'dd/MM/yyyy', { locale: fr })}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {certificate.marriageTime}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>{certificate.marriagePlace}</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" color="info" onClick={() => onView(certificate._id)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="primary" onClick={() => onEdit(certificate._id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDelete(certificate._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        );
      
      default:
        return (
          <TableRow key={certificate._id} hover>
            <TableCell>
              <Box>
                <Typography variant="body2">
                  {certificate.registryNumber}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Acte: {certificate.recordNumber}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Typography variant="body1">
                  {certificate.firstName} {certificate.familyName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Père: {certificate.fatherFirstName}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Typography variant="body2">
                  {format(new Date(certificate.birthDate), 'dd/MM/yyyy', { locale: fr })}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {certificate.birthTime}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>{certificate.birthPlace}</TableCell>
            <TableCell>
              <Chip
                label={certificate.gender}
                size="small"
                color={certificate.gender === 'MASCULIN' ? 'primary' : 'secondary'}
                variant="outlined"
              />
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" color="info" onClick={() => onView(certificate._id)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="primary" onClick={() => onEdit(certificate._id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDelete(certificate._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        );
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Liste des {type === 'birth' ? 'extraits' : 'certificats'} ({certificates.length})
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {getHeaders().map((header) => (
                <TableCell key={header}><strong>{header}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedCertificates.map((certificate) => renderRow(certificate))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={certificates.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Lignes par page:"
      />
    </Paper>
  );
};

export default CertificateList;
