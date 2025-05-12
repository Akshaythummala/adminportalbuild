import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/config';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import MaterialTable from '../components/MaterialTable';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { BUTTON_STYLE, DIALOG_CLOSE_BUTTON_STYLE } from '../constants/styles';

const AdminRegister = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    company_name: '',
    company_email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdmins, setShowAdmins] = useState(false);

  // Fetch admin details without token requirement
  const { data: adminData, isLoading: adminLoading, error: adminError } = useQuery({
    queryKey: ['adminDetails'],
    queryFn: async () => {
      const response = await api.get('/master-admin-details');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Prepare the request payload
    const payload = {
      username: formData.username.trim(),
      company_name: formData.company_name.trim(),
      company_email: formData.company_email.trim(),
      phone_number: formData.phone_number.trim(),
      password: formData.password,
      confirm_password: formData.confirm_password
    };

    // Log the payload for debugging
    console.log('Registration payload:', payload);

    try {
      const response = await api.post('/admin/register', payload);

      if (response.data) {
        // Redirect to login page after successful registration
        navigate('/login', { 
          state: { message: 'Registration successful. Please login.' }
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle validation errors from the server
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.detail;
        console.log('Validation errors:', validationErrors);
        
        if (Array.isArray(validationErrors)) {
          setError(validationErrors.map(err => err.msg).join(', '));
        } else if (typeof validationErrors === 'object') {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          setError(errorMessages);
        } else {
          setError(validationErrors || 'Invalid input data');
        }
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f0ff 0%, #fafcff 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm" sx={{ mb: 4 }}>
        <Paper
          elevation={6}
          sx={{
            p: 5,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'white',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}
        >
          <PersonAddIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h5" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
            Admin Registration
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  error={!!error && error.toLowerCase().includes('username')}
                  disabled={loading}
                  sx={{ backgroundColor: 'background.paper' }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Company Name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  autoComplete="organization"
                  error={!!error && error.toLowerCase().includes('company_name')}
                  disabled={loading}
                  sx={{ backgroundColor: 'background.paper' }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Company Email"
                  name="company_email"
                  type="email"
                  value={formData.company_email}
                  onChange={handleChange}
                  autoComplete="email"
                  error={!!error && error.toLowerCase().includes('email')}
                  disabled={loading}
                  sx={{ backgroundColor: 'background.paper' }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  autoComplete="tel"
                  error={!!error && error.toLowerCase().includes('phone')}
                  disabled={loading}
                  sx={{ backgroundColor: 'background.paper' }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={BUTTON_STYLE}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirm_password"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box sx={{ width: 30 }} /> {/* Spacer to match password field width */}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5, 
                fontWeight: 600, 
                fontSize: 16, 
                letterSpacing: 1,
                ...BUTTON_STYLE 
              }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ 
                mt: 1,
                ...BUTTON_STYLE 
              }}
            >
              Already have an account? Login
            </Button>
            {token && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowAdmins(true)}
                sx={{ 
                  mt: 2,
                  ...BUTTON_STYLE 
                }}
              >
                View Existing Admins
              </Button>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Admin Details Dialog */}
      <Dialog 
        open={showAdmins} 
        onClose={() => setShowAdmins(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Existing Admin Details
          <IconButton
            aria-label="close"
            onClick={() => setShowAdmins(false)}
            sx={DIALOG_CLOSE_BUTTON_STYLE}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <MaterialTable
            data={adminData || []}
            loading={adminLoading}
            error={adminError ? (adminError.message || 'Failed to load admin details') : null}
            title="Admin Details"
          />
        </DialogContent>
      </Dialog>

      {/* Admin Details Table - Always visible */}
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 4,
            background: 'white',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
            Existing Admin Details
          </Typography>
          <MaterialTable
            data={adminData || []}
            loading={adminLoading}
            error={adminError ? (adminError.message || 'Failed to load admin details') : null}
            title="Admin Details"
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminRegister; 