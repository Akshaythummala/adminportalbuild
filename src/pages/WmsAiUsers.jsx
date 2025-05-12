import { useData } from '../hooks/useData';
import { endpoints } from '../api/config';
import MaterialTable from '../components/MaterialTable';
import DashboardLayout from '../components/DashboardLayout';
import { useMemo } from 'react';

const WmsAiUsers = () => {
  const { data, isLoading, error } = useData(endpoints.wmsAiUsers);

  // Generate columns dynamically based on the first user's data
  const columns = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];

    // Get the first user's data to determine the structure
    const firstUser = Object.values(data)[0];
    
    // Create columns for all fields in the user data
    return Object.keys(firstUser).map(key => ({
      accessorKey: key,
      header: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      minSize: 200,
      size: 220,
    }));
  }, [data]);

  // Transform the data for the table
  const tableData = useMemo(() => {
    if (!data) return [];
    
    return Object.values(data);
  }, [data]);

  return (
    <DashboardLayout>
      <MaterialTable
        data={tableData}
        loading={isLoading}
        error={error ? (error.message || 'Failed to load WMS AI Users') : null}
        title="WMS AI Users"
        columns={columns}
      />
    </DashboardLayout>
  );
};

export default WmsAiUsers; 