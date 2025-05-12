import { useData } from '../hooks/useData';
import { endpoints } from '../api/config';
import MaterialTable from '../components/MaterialTable';
import DashboardLayout from '../components/DashboardLayout';
import { useMemo } from 'react';

// Helper function to flatten nested objects
const flattenObject = (obj, prefix = '') => {
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
};

const Items = () => {
  const { data, isLoading, error } = useData(endpoints.items);

  // Define custom columns with sorting enabled
  const columns = useMemo(() => [
    { 
      accessorKey: 'id', 
      header: 'ID',
      minSize: 200,
      size: 220,
      enableSorting: true
    },
    { 
      accessorKey: 'name', 
      header: 'Name',
      minSize: 200,
      size: 220,
      enableSorting: true
    },
    { 
      accessorKey: 'upc_code', 
      header: 'UPC Code',
      minSize: 200,
      size: 220,
      enableSorting: true
    }
  ], []);

  // Convert object to array for MaterialTable
  const tableData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }, [data]);

  return (
    <DashboardLayout>
      <MaterialTable
        data={tableData}
        loading={isLoading}
        error={error ? (error.message || 'Failed to load items') : null}
        title="Items"
        columns={columns}
        initialState={{
          sorting: [
            {
              id: 'id',
              desc: false
            }
          ]
        }}
      />
    </DashboardLayout>
  );
};

export default Items; 