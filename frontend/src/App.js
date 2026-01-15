import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import AddCertificate from './pages/AddCertificate';
import ViewCertificates from './pages/ViewCertificates';
import AddDeathCertificate from './pages/AddDeathCertificate';
import ViewDeathCertificates from './pages/ViewDeathCertificates';
import AddMarriageCertificate from './pages/AddMarriageCertificate';
import ViewMarriageCertificates from './pages/ViewMarriageCertificates';
import ImportCSV from './pages/ImportCSV';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Naissance */}
            <Route path="/add-birth-certificate" element={<AddCertificate />} />
            <Route path="/birth-certificates" element={<ViewCertificates />} />
            <Route path="/birth-certificates/:id" element={<AddCertificate isEdit />} />
            
            {/* Décès */}
            <Route path="/add-death-certificate" element={<AddDeathCertificate />} />
            <Route path="/death-certificates" element={<ViewDeathCertificates />} />
            <Route path="/death-certificates/:id" element={<AddDeathCertificate isEdit />} />
            
            {/* Mariage */}
            <Route path="/add-marriage-certificate" element={<AddMarriageCertificate />} />
            <Route path="/marriage-certificates" element={<ViewMarriageCertificates />} />
            <Route path="/marriage-certificates/:id" element={<AddMarriageCertificate isEdit />} />
            
            {/* Import */}
            <Route path="/import" element={<ImportCSV />} />
            
            {/* Routes par défaut pour compatibilité */}
            <Route path="/add" element={<AddCertificate />} />
            <Route path="/certificates" element={<ViewCertificates />} />
            <Route path="/certificates/:id" element={<AddCertificate isEdit />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
