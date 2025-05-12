import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import Login from './pages/Login';
import Locations from './pages/Locations';
import Bins from './pages/Bins';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Items from './pages/Items';
import SalesOrders from './pages/SalesOrders';
import Dashboard from './pages/Dashboard';
import BinCountRecords from './pages/BinCountRecords';
import WmsAiUsers from './pages/WmsAiUsers';
import AdminRegister from './pages/AdminRegister';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/register"
              element={
                <PublicRoute>
                  <AdminRegister />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/locations"
              element={
                <PrivateRoute>
                  <Locations />
                </PrivateRoute>
              }
            />
            <Route
              path="/bins"
              element={
                <PrivateRoute>
                  <Bins />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <Inventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/items"
              element={
                <PrivateRoute>
                  <Items />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales-orders"
              element={
                <PrivateRoute>
                  <SalesOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/bin-count-records"
              element={
                <PrivateRoute>
                  <BinCountRecords />
                </PrivateRoute>
              }
            />
            <Route
              path="/wms-ai-users"
              element={
                <PrivateRoute>
                  <WmsAiUsers />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
