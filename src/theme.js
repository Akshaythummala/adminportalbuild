import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D3648', // Deep blue-grey
      light: '#4A5568', // Medium blue-grey
      dark: '#1A202C', // Darker shade for hover states
    },
    secondary: {
      main: '#718096', // Light blue-grey
      light: '#A0AEC0', // Lighter shade
      dark: '#4A5568', // Darker shade
    },
    background: {
      default: '#F7FAFC', // Very light blue-grey
      paper: '#FFFFFF', // White
      surface: '#EDF2F7', // Light grey
    },
    text: {
      primary: '#2D3748', // Dark blue-grey
      secondary: '#718096', // Medium grey
    },
    error: {
      main: '#E53E3E', // Red
    },
    success: {
      main: '#48BB78', // Green
    },
    warning: {
      main: '#ED8936', // Orange
    },
    grey: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: '#1A202C',
          },
        },
        contained: {
          backgroundColor: '#2D3648',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1A202C',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#2D3648',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2D3648',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E2E8F0',
        },
        head: {
          backgroundColor: '#F7FAFC',
          color: '#2D3748',
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F7FAFC',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#2D3748',
    },
    h2: {
      fontWeight: 700,
      color: '#2D3748',
    },
    h3: {
      fontWeight: 600,
      color: '#2D3748',
    },
    h4: {
      fontWeight: 600,
      color: '#2D3748',
    },
    h5: {
      fontWeight: 600,
      color: '#2D3748',
    },
    h6: {
      fontWeight: 600,
      color: '#2D3748',
    },
    body1: {
      color: '#4A5568',
    },
    body2: {
      color: '#718096',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme; 