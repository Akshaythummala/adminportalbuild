import { useData } from '../hooks/useData';
import { endpoints } from '../api/config';
import MaterialTable from '../components/MaterialTable';
import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Helper to flatten the nested inventory data
function flattenInventoryData(data) {
  const rows = [];
  if (!data || typeof data !== 'object') return rows;
  Object.entries(data).forEach(([internal_id, bins]) => {
    if (typeof bins === 'object') {
      Object.entries(bins).forEach(([location_id, binData]) => {
        if (binData && Array.isArray(binData.itemDetails)) {
          binData.itemDetails.forEach((item) => {
            rows.push({
              internal_id,
              location_id,
              ...item,
              total_available: binData.total_available,
            });
          });
        }
      });
    }
  });
  return rows;
}

// Helper to group by item
function groupByItem(rows) {
  const map = new Map();
  rows.forEach(row => {
    if (!map.has(row.item)) {
      map.set(row.item, []);
    }
    map.get(row.item).push(row);
  });
  // For each item, return the first row for the main table, and attach all rows as details
  return Array.from(map.entries()).map(([item, group]) => {
    // Sum total_available for unique locations
    const uniqueLocations = new Set();
    let totalAvailableSum = 0;
    group.forEach(row => {
      if (!uniqueLocations.has(row.location_id)) {
        uniqueLocations.add(row.location_id);
        if (typeof row.total_available === 'number') {
          totalAvailableSum += row.total_available;
        } else if (typeof row.total_available === 'string' && !isNaN(Number(row.total_available))) {
          totalAvailableSum += Number(row.total_available);
        }
      }
    });
    return {
      ...group[0],
      total_available: totalAvailableSum,
      _details: group, // Always include details, even for single items
    };
  });
}

const Inventory = () => {
  const { data, isLoading, error } = useData(endpoints.inventory);
  const flatData = flattenInventoryData(data);
  const groupedData = groupByItem(flatData);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);

  // Main columns to show
  const mainColumns = [
    { accessorKey: 'internal_id', header: 'Internal Id', minSize: 200, size: 220 },
    { accessorKey: 'item', header: 'Item', minSize: 200, size: 220 },
    { accessorKey: 'total_available', header: 'Total Available', minSize: 200, size: 220 },
    {
      accessorKey: 'actions',
      header: '',
      minSize: 120,
      size: 140,
      cell: info => {
        const row = info.row.original;
          return (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setDetails(row._details);
                setOpen(true);
              }}
            >
              View Details
            </Button>
          );
      },
      enableResizing: false,
      filterFn: undefined,
    },
  ];

  // Prepare data for the nested table
  const nestedTableData = details || [];

  return (
    <DashboardLayout>
      <MaterialTable
        data={groupedData}
        loading={isLoading}
        error={error ? (error.message || 'Failed to load inventory') : null}
        title="Inventory"
        columns={mainColumns}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          Inventory Details
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ minWidth: '1200px' }}>
          {nestedTableData.length > 0 ? (
            <MaterialTable data={nestedTableData} title="Details" />
          ) : (
            'No details available.'
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Inventory; 