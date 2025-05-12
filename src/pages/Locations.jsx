import { useData } from '../hooks/useData';
import { endpoints } from '../api/config';
import MaterialTable from '../components/MaterialTable';
import DashboardLayout from '../components/DashboardLayout';

const Locations = () => {
  const { data, isLoading, error } = useData(endpoints.locations);

  return (
    <DashboardLayout>
      <MaterialTable
        data={data || []}
        loading={isLoading}
        error={error ? (error.message || 'Failed to load locations') : null}
        title="Locations"
      />
    </DashboardLayout>
  );
};

export default Locations; 