import React from 'react';
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Collapse,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Add as AddIcon,
  List as ListIcon,
  Upload as UploadIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as BirthIcon,
  PersonOff as DeathIcon,
  Favorite as MarriageIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openBirth, setOpenBirth] = React.useState(false);
  const [openDeath, setOpenDeath] = React.useState(false);
  const [openMarriage, setOpenMarriage] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Accueil', icon: <HomeIcon />, path: '/' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}

        {/* Naissance */}
        <ListItemButton onClick={() => setOpenBirth(!openBirth)}>
          <ListItemIcon>
            <BirthIcon />
          </ListItemIcon>
          <ListItemText primary="Naissance" />
          {openBirth ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openBirth} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/add-birth-certificate')}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Nouvel extrait" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/birth-certificates')}>
              <ListItemIcon>
                <ListIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Liste des extraits" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Décès */}
        <ListItemButton onClick={() => setOpenDeath(!openDeath)}>
          <ListItemIcon>
            <DeathIcon />
          </ListItemIcon>
          <ListItemText primary="Décès" />
          {openDeath ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openDeath} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/add-death-certificate')}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Nouveau certificat" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/death-certificates')}>
              <ListItemIcon>
                <ListIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Liste des certificats" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Mariage */}
        <ListItemButton onClick={() => setOpenMarriage(!openMarriage)}>
          <ListItemIcon>
            <MarriageIcon />
          </ListItemIcon>
          <ListItemText primary="Mariage" />
          {openMarriage ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMarriage} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/add-marriage-certificate')}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Nouveau certificat" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/marriage-certificates')}>
              <ListItemIcon>
                <ListIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Liste des certificats" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Import CSV */}
        <ListItem
          button
          onClick={() => {
            navigate('/import');
            if (isMobile) setMobileOpen(false);
          }}
          selected={location.pathname === '/import'}
        >
          <ListItemIcon>
            <UploadIcon />
          </ListItemIcon>
          <ListItemText primary="Import CSV" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            Gestion des États Civils
          </Typography>
        </Toolbar>
      </AppBar>

      {!isMobile ? (
        <Drawer
          variant="permanent"
          sx={{
            width: 250,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { width: 250 },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
