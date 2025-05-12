import { useData } from '../hooks/useData';
import { endpoints } from '../api/config';
import MaterialTable from '../components/MaterialTable';
import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SalesOrders = () => {
  const { data, isLoading, error } = useData(endpoints.salesOrders);
  const [open, setOpen] = useState(false);
  const [nestedData, setNestedData] = useState(null);
  const [nestedTitle, setNestedTitle] = useState('');

  // Custom cell renderer for itemDetails column
  const renderItemDetailsCell = (itemDetails) => {
    console.log('itemDetails cell value:', itemDetails);
    if (itemDetails && (Array.isArray(itemDetails) || typeof itemDetails === 'object')) {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={e => {
            setNestedData(Array.isArray(itemDetails) ? itemDetails : Object.values(itemDetails));
            setNestedTitle('Item Details');
            setOpen(true);
          }}
        >
          View Item Details
        </Button>
      );
    }
    return itemDetails ? String(itemDetails) : '';
  };

  // Prepare columns with custom render for itemDetails
  const columns = data && data.length > 0
    ? Object.keys(data[0]).map((key) => ({
        accessorKey: key,
        header: key
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        minSize: 200,
        size: 220,
        cell: key === 'itemDetails'
          ? info => renderItemDetailsCell(info.getValue())
          : info => {
              const value = info.getValue();
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
        error={error ? (error.message || 'Failed to load sales orders') : null}
        title="Sales Orders"
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
            'No item details data available.'
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SalesOrders; 