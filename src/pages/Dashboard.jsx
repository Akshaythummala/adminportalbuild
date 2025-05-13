import DashboardLayout from '../components/DashboardLayout';
import { Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert, CircularProgress, Grid, Paper } from '@mui/material';
import { useState, useCallback } from 'react';
import { api, endpoints } from '../api/config';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import SyncIcon from '@mui/icons-material/Sync';
import { useData } from '../hooks/useData';
import {
  LocationOn,
  Storage,
  People,
  Inventory,
  Category,
  ShoppingCart,
  Assessment,
  SmartToy,
} from '@mui/icons-material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';

// Stat Card Component
const StatCard = ({ title, count, icon, loading, error }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 2,
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          color: 'primary.main',
          mb: 2,
          transition: 'all 0.3s ease',
        }}
      >
        {icon}
      </Box>
      <Typography 
        variant="h6" 
        color="text.secondary" 
        gutterBottom
        sx={{
          textAlign: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {title}
      </Typography>
      {loading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Typography color="error">Error</Typography>
      ) : (
        <Typography 
          variant="h4" 
          color="primary" 
          fontWeight="bold"
          sx={{
            transition: 'all 0.3s ease',
          }}
        >
          {count}
        </Typography>
      )}
    </Paper>
  );
};

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userid: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ success: false, error: null });
  const { token } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Fetch data using the useData hook
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useData(endpoints.locations);
  const { data: binsData, isLoading: binsLoading, error: binsError } = useData(endpoints.bins);
  const { data: usersData, isLoading: usersLoading, error: usersError } = useData(endpoints.users);
  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useData(endpoints.inventory);
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useData(endpoints.items);
  const { data: salesOrdersData, isLoading: salesOrdersLoading, error: salesOrdersError } = useData(endpoints.salesOrders);
  const { data: wmsAiUsersData, isLoading: wmsAiUsersLoading, error: wmsAiUsersError } = useData(endpoints.wmsAiUsers);
  const { data: binCountRecordsData, isLoading: binCountRecordsLoading, error: binCountRecordsError } = useData(endpoints.binCountRecords);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setForm({ userid: '', email: '', password: '' });
    setError('');
    setSuccess('');
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setError('');
    setSuccess('');
  }, []);

  const handleChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }
    try {
      await api.post('/admin/register-user', {
        userid: form.userid,
        email: form.email,
        password: form.password,
      });
      setSuccess('User created successfully!');
      setForm({ userid: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleSync = useCallback(async () => {
    if (syncLoading) return; // Prevent multiple simultaneous syncs
    
    setSyncLoading(true);
    setSyncStatus({ success: false, error: null });

    const endpoints = [
      '/netsuite/locations',
      '/netsuite/users',
      '/netsuite/bins',
      '/netsuite/inventory',
      '/netsuite/items',
      '/netsuite/sales-orders'
    ];

    console.log('Starting NetSuite sync process...');
    console.log('Token being used:', token);
    console.log('Endpoints to sync:', endpoints);

    try {
      // Create an array of promises for all sync operations
      const syncPromises = endpoints.map(endpoint => {
        console.log(`Initiating sync for endpoint: ${endpoint}`);
        return api.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(response => {
          console.log(`Successfully synced ${endpoint}:`, response.data);
          return response;
        }).catch(error => {
          console.error(`Error syncing ${endpoint}:`, error.response?.data || error.message);
          throw error;
        });
      });

      console.log('All sync requests initiated, waiting for responses...');

      // Wait for all sync operations to complete
      const results = await Promise.all(syncPromises);
      
      console.log('All sync operations completed successfully:', results.map(r => r.status));
      
      setSyncStatus(prev => ({ 
        ...prev,
        success: true, 
        error: null 
      }));
    } catch (err) {
      console.error('Sync process failed:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      setSyncStatus(prev => ({ 
        ...prev,
        success: false, 
        error: err.response?.data?.detail || 'Failed to sync with NetSuite' 
      }));
    } finally {
      console.log('Sync process completed');
      setSyncLoading(false);
    }
  }, [token, syncLoading]);

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" gutterBottom>
          Welcome to the Admin Portal
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSync}
            disabled={syncLoading}
            startIcon={syncLoading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
            sx={{ mr: 2, minWidth: 150 }}
          >
            {syncLoading ? 'Syncing...' : 'Sync from NetSuite'}
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpen} 
            sx={{ minWidth: 150 }}
          >
            Create User
          </Button>
        </Box>
      </Box>

      {syncStatus.success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Successfully synced all data from NetSuite
        </Alert>
      )}

      {syncStatus.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {syncStatus.error}
        </Alert>
      )}

      {/* Stat Cards Grid */}
      <Grid 
        container 
        spacing={3} 
        sx={{ 
          mb: 4,
          transition: 'all 0.3s ease',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 3
        }}
      >
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Locations"
            count={locationsData?.length || 0}
            icon={<LocationOn sx={{ fontSize: 30 }} />}
            loading={locationsLoading}
            error={locationsError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Bins"
            count={binsData?.length || 0}
            icon={<Storage sx={{ fontSize: 30 }} />}
            loading={binsLoading}
            error={binsError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Users"
            count={usersData?.length || 0}
            icon={<People sx={{ fontSize: 30 }} />}
            loading={usersLoading}
            error={usersError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Inventory Items"
            count={inventoryData?.length || 0}
            icon={<Inventory sx={{ fontSize: 30 }} />}
            loading={inventoryLoading}
            error={inventoryError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Items"
            count={itemsData ? Object.keys(itemsData).length : 0}
            icon={<Category sx={{ fontSize: 30 }} />}
            loading={itemsLoading}
            error={itemsError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Sales Orders"
            count={salesOrdersData?.length || 0}
            icon={<ShoppingCart sx={{ fontSize: 30 }} />}
            loading={salesOrdersLoading}
            error={salesOrdersError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Bin Count Records"
            count={binCountRecordsData?.length || 0}
            icon={<Assessment sx={{ fontSize: 30 }} />}
            loading={binCountRecordsLoading}
            error={binCountRecordsError}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="WMS AI Users"
            count={wmsAiUsersData?.length || 0}
            icon={<SmartToy sx={{ fontSize: 30 }} />}
            loading={wmsAiUsersLoading}
            error={wmsAiUsersError}
          />
        </Grid>
      </Grid>


      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          Create User
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              margin="normal"
              required
              fullWidth
              label="User ID"
              name="userid"
              value={form.userid}
              onChange={handleChange}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && <Typography color="error" mt={2}>{error}</Typography>}
            {success && <Typography color="primary" mt={2}>{success}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard; 