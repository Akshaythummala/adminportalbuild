import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LocationOn,
  Storage,
  People,
  Inventory,
  Category,
  ShoppingCart,
  Logout,
  Home,
  Assessment,
  SmartToy,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Home />, path: '/dashboard' },
  { text: 'Locations', icon: <LocationOn />, path: '/locations' },
  { text: 'Bins', icon: <Storage />, path: '/bins' },
  { text: 'Admins', icon: <People />, path: '/users' },
  { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
  { text: 'Items', icon: <Category />, path: '/items' },
  { text: 'Sales Orders', icon: <ShoppingCart />, path: '/sales-orders' },
  { text: 'Bin Count Records', icon: <Assessment />, path: '/bin-count-records' },
  { text: 'WMS AI Users', icon: <SmartToy />, path: '/wms-ai-users' },
];

const DashboardLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef(null);

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(true);
  };

  // Focus management for accessibility
  useEffect(() => {
    if (!drawerOpen && mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [drawerOpen]);

  const drawer = (
    <div role="navigation" aria-label="Main navigation">
      <Toolbar />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={logout}
            sx={{ 
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: 'width 0.3s, margin 0.3s',
          backgroundColor: 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              color: 'common.white',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'common.white' }}>
            WMS.ai Admin Portal
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={!drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
            disableEnforceFocus: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="persistent"
          sx={{
            display: { xs: 'none', sm: drawerOpen ? 'block' : 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              transition: 'width 0.3s',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            },
          }}
          open={drawerOpen}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        ref={mainContentRef}
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: 'width 0.3s',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          position: 'relative',
          mt: '30px',
          pt: 0
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 