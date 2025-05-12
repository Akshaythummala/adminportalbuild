import { useData } from '../hooks/useData';
import { endpoints } from '../api/config';
import MaterialTable from '../components/MaterialTable';
import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Admins = () => {
  const { data, isLoading, error } = useData(endpoints.users);
  const [open, setOpen] = useState(false);
  const [nestedData, setNestedData] = useState(null);
  const [nestedTitle, setNestedTitle] = useState('');

  // Custom cell renderer for locations column
  const renderLocationsCell = (locations) => {
    if (locations && (Array.isArray(locations) || typeof locations === 'object')) {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={e => {
            setNestedData(Array.isArray(locations) ? locations : Object.values(locations));
            setNestedTitle('Admin Locations');
            setOpen(true);
          }}
        >
          View Locations
        </Button>
      );
    }
    return locations ? String(locations) : '';
  };

  // Prepare columns with custom render for locations
  const columns = data && data.length > 0
    ? Object.keys(data[0]).map((key) => ({
        accessorKey: key,
        header: key
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        minSize: 240,
        size: 260,
        cell: key === 'locations'
          ? info => renderLocationsCell(info.getValue())
          : info => {
              const value = info.getValue();
              // Render objects/arrays as JSON string for other columns
              if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value);
              }
              return value;
            },
      }))
    : [];

  return (
    <DashboardLayout>
      <MaterialTable
        data={data || []}
        loading={isLoading}
        error={error ? (error.message || 'Failed to load admins') : null}
        title="Admins"
        columns={columns}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {nestedTitle}
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {nestedData && nestedData.length > 0 ? (
            <MaterialTable data={nestedData} title={nestedTitle} />
          ) : (
            'No location data available.'
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Admins; 