import { useData } from '../hooks/useData';
import { endpoints } from '../api/config';
import MaterialTable from '../components/MaterialTable';
import DashboardLayout from '../components/DashboardLayout';

const Bins = () => {
  const { data, isLoading, error } = useData(endpoints.bins);

  return (
    <DashboardLayout>
      <MaterialTable
        data={data || []}
        loading={isLoading}
        error={error ? (error.message || 'Failed to load bins') : null}
        title="Bins"
      />
    </DashboardLayout>
  );
};

export default Bins; 