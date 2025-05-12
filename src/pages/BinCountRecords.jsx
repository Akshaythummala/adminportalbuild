import { useData } from '../hooks/useData';
import { endpoints } from '../api/config';
import MaterialTable from '../components/MaterialTable';
import DashboardLayout from '../components/DashboardLayout';
import { useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button, Box, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  BUTTON_STYLE,
  DIALOG_CLOSE_BUTTON_STYLE,
  COLUMN_MIN_SIZE,
  COLUMN_SIZE,
  DIALOG_MAX_WIDTH,
  BUTTON_VARIANT,
  BUTTON_SIZE
} from '../constants/styles';

// Helper function to flatten nested objects and arrays
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}_${key}` : key;
    
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        // Handle arrays by stringifying them
        flattened[newKey] = JSON.stringify(value);
      } else {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey));
      }
    } else {
      // Handle primitive values
      flattened[newKey] = value;
    }
  });
  
  return flattened;
}

// Helper function to convert object to table format
function convertToTableFormat(data) {
  if (!data || typeof data !== 'object') return [];
  
  // If data is an array, process each item
  if (Array.isArray(data)) {
    return data.map(item => convertToTableFormat(item)[0]);
  }
  
  // For single object, create a row with all properties
  const row = {};
  
  function processObject(obj, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Store the object as is for netsuite_response
        if (key === 'netsuite_response' || newKey.endsWith('_netsuite_response')) {
          row[newKey] = value;
        } else {
          // Recursively flatten other nested objects
          processObject(value, newKey);
        }
      } else if (Array.isArray(value)) {
        // Store the array as is for itemData
        if (key === 'itemData' || newKey.endsWith('_itemData')) {
          row[newKey] = value;
        } else {
          // Handle other arrays by joining their values
          row[newKey] = value.join(', ');
        }
      } else {
        // Handle primitive values
        row[newKey] = value;
      }
    });
  }
  
  processObject(data);
  return [row];
}

// Helper function to format column header
const formatColumnHeader = (key) => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Helper function to create base column configuration
const createBaseColumn = (key) => ({
  accessorKey: key,
  header: formatColumnHeader(key),
  minSize: COLUMN_MIN_SIZE,
  size: COLUMN_SIZE,
});

const BinCountRecords = () => {
  const { data, isLoading, error } = useData(endpoints.binCountRecords);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [binsOpen, setBinsOpen] = useState(false);
  const [binsDetails, setBinsDetails] = useState(null);
  const [itemDataOpen, setItemDataOpen] = useState(false);
  const [itemDataDetails, setItemDataDetails] = useState(null);
  const [netsuiteOpen, setNetsuiteOpen] = useState(false);
  const [netsuiteDetails, setNetsuiteDetails] = useState(null);

  // Process the data to handle bin_data and bins_data
  const processedData = useMemo(() => {
    if (!data) return [];
    return data.map(record => {
      const binData = record.bin_data ? convertToTableFormat(record.bin_data) : [];
      const binsData = record.bins_data ? convertToTableFormat(record.bins_data) : [];
      // Only include bins_data if it has data
      const processedRecord = {
        ...record,
        bin_data: binData
      };
      if (binsData && binsData.length > 0) {
        processedRecord.bins_data = binsData;
      }
      return processedRecord;
    });
  }, [data]);

  // Generate main columns dynamically
  const columns = useMemo(() => {
    if (!processedData.length) return [];
    
    // Get all unique keys from the first record, excluding bin_data and bins_data
    const keys = Object.keys(processedData[0]).filter(key => !['bin_data', 'bins_data'].includes(key));
    
    const baseColumns = [
      ...keys.map(key => ({
        ...createBaseColumn(key),
        cell: info => {
          const value = info.getValue();
          if (key === 'netsuite_response' && value && typeof value === 'object') {
            return (
              <Button
                variant={BUTTON_VARIANT}
                size={BUTTON_SIZE}
                sx={BUTTON_STYLE}
                onClick={() => {
                  setNetsuiteDetails(value);
                  setNetsuiteOpen(true);
                }}
              >
                View Response
              </Button>
            );
          }
          return value;
        },
      })),
      {
        ...createBaseColumn('bin_data'),
        header: 'Bin Data',
        cell: info => {
          const binData = info.getValue();
          if (binData && binData.length > 0) {
            return (
              <Button
                variant={BUTTON_VARIANT}
                size={BUTTON_SIZE}
                sx={BUTTON_STYLE}
                onClick={() => {
                  setDetails(binData);
                  setOpen(true);
                }}
              >
                View Details
              </Button>
            );
          }
          return 'No Data';
        },
      },
    ];

    // Only add bins_data column if it exists in the data
    if (processedData.some(record => record.bins_data)) {
      baseColumns.push({
        ...createBaseColumn('bins_data'),
        header: 'Bins Data',
        cell: info => {
          const binsData = info.getValue();
          if (binsData && binsData.length > 0) {
            return (
              <Button
                variant={BUTTON_VARIANT}
                size={BUTTON_SIZE}
                sx={BUTTON_STYLE}
                onClick={() => {
                  setBinsDetails(binsData);
                  setBinsOpen(true);
                }}
              >
                View Bins
              </Button>
            );
          }
          return null;
        },
      });
    }

    return baseColumns;
  }, [processedData]);

  // Generate detail columns dynamically
  const detailColumns = useMemo(() => {
    if (!details || !details.length) return [];
    
    // Get all unique keys from the first detail record
    const keys = Object.keys(details[0]);
    
    return keys.map(key => ({
      ...createBaseColumn(key),
      cell: info => {
        const value = info.getValue();
        if ((key === 'itemData' || key.endsWith('_itemData')) && Array.isArray(value)) {
          return (
            <Button
              variant={BUTTON_VARIANT}
              size={BUTTON_SIZE}
              sx={BUTTON_STYLE}
              onClick={() => {
                setItemDataDetails(value);
                setItemDataOpen(true);
              }}
            >
              View Items ({value.length})
            </Button>
          );
        }
        if ((key === 'netsuite_response' || key.endsWith('_netsuite_response')) && value && typeof value === 'object') {
          return (
            <Button
              variant={BUTTON_VARIANT}
              size={BUTTON_SIZE}
              sx={BUTTON_STYLE}
              onClick={() => {
                setNetsuiteDetails(value);
                setNetsuiteOpen(true);
              }}
            >
              View Response
            </Button>
          );
        }
        return value;
      },
    }));
  }, [details]);

  // Generate bins detail columns dynamically
  const binsDetailColumns = useMemo(() => {
    if (!binsDetails || !binsDetails.length) return [];
    
    // Get all unique keys from the first bins detail record
    const keys = Object.keys(binsDetails[0]);
    
    return keys.map(key => ({
      ...createBaseColumn(key),
      cell: info => {
        const value = info.getValue();
        if ((key === 'itemData' || key.endsWith('_itemData')) && Array.isArray(value)) {
          return (
            <Button
              variant={BUTTON_VARIANT}
              size={BUTTON_SIZE}
              sx={BUTTON_STYLE}
              onClick={() => {
                setItemDataDetails(value);
                setItemDataOpen(true);
              }}
            >
              View Items ({value.length})
            </Button>
          );
        }
        if ((key === 'netsuite_response' || key.endsWith('_netsuite_response')) && value && typeof value === 'object') {
          return (
            <Button
              variant={BUTTON_VARIANT}
              size={BUTTON_SIZE}
              sx={BUTTON_STYLE}
              onClick={() => {
                setNetsuiteDetails(value);
                setNetsuiteOpen(true);
              }}
            >
              View Response
            </Button>
          );
        }
        return value;
      },
    }));
  }, [binsDetails]);

  // Generate item data columns dynamically
  const itemDataColumns = useMemo(() => {
    if (!itemDataDetails || !itemDataDetails.length) return [];
    
    // Get all unique keys from the first item
    const keys = Object.keys(itemDataDetails[0]);
    
    return keys.map(key => createBaseColumn(key));
  }, [itemDataDetails]);

  // Generate netsuite response columns dynamically
  const netsuiteColumns = useMemo(() => {
    if (!netsuiteDetails) return [];
    
    // Flatten the netsuite response object
    const flattenedData = flattenObject(netsuiteDetails);
    
    // Create columns from the flattened keys
    return Object.keys(flattenedData).map(key => createBaseColumn(key));
  }, [netsuiteDetails]);

  return (
    <DashboardLayout>
      <MaterialTable
        data={processedData}
        loading={isLoading}
        error={error ? (error.message || 'Failed to load bin count records') : null}
        title="Bin Count Records"
        columns={columns}
      />
      {/* Bin Data Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth={DIALOG_MAX_WIDTH} fullWidth>
        <DialogTitle>
          Bin Data Details
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={DIALOG_CLOSE_BUTTON_STYLE}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom>
                  Bin Details
                </Typography>
                <MaterialTable
                  data={details || []}
                  loading={false}
                  title="Bin Details"
                  columns={detailColumns}
                />
              </Grid>
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom>
                  Item Details
                </Typography>
                <MaterialTable
                  data={itemDataDetails || []}
                  loading={false}
                  title="Item Details"
                  columns={itemDataColumns}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Bins Data Dialog */}
      <Dialog open={binsOpen} onClose={() => setBinsOpen(false)} maxWidth={DIALOG_MAX_WIDTH} fullWidth>
        <DialogTitle>
          Bins Data Details
          <IconButton
            aria-label="close"
            onClick={() => setBinsOpen(false)}
            sx={DIALOG_CLOSE_BUTTON_STYLE}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {binsDetails && binsDetails.length > 0 ? (
            <MaterialTable
              data={binsDetails}
              title="Bins Data Details"
              columns={binsDetailColumns}
            />
          ) : (
            'No bins data available.'
          )}
        </DialogContent>
      </Dialog>
      {/* Item Data Dialog */}
      <Dialog open={itemDataOpen} onClose={() => setItemDataOpen(false)} maxWidth={DIALOG_MAX_WIDTH} fullWidth>
        <DialogTitle>
          Item Data Details
          <IconButton
            aria-label="close"
            onClick={() => setItemDataOpen(false)}
            sx={DIALOG_CLOSE_BUTTON_STYLE}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {itemDataDetails && itemDataDetails.length > 0 ? (
            <MaterialTable
              data={itemDataDetails}
              title="Item Data Details"
              columns={itemDataColumns}
            />
          ) : (
            'No item data available.'
          )}
        </DialogContent>
      </Dialog>
      {/* Netsuite Response Dialog */}
      <Dialog open={netsuiteOpen} onClose={() => setNetsuiteOpen(false)} maxWidth={DIALOG_MAX_WIDTH} fullWidth>
        <DialogTitle>
          Netsuite Response Details
          <IconButton
            aria-label="close"
            onClick={() => setNetsuiteOpen(false)}
            sx={DIALOG_CLOSE_BUTTON_STYLE}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {netsuiteDetails ? (
            <MaterialTable
              data={[flattenObject(netsuiteDetails)]}
              title="Netsuite Response Details"
              columns={netsuiteColumns}
            />
          ) : (
            'No netsuite response data available.'
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BinCountRecords; 