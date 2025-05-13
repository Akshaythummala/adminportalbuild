import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '../api/config';

export const useData = (endpoint) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      try {
        console.log('Fetching data from:', endpoint);
        const token = localStorage.getItem('token');
        console.log('Token available:', !!token);
        
        const response = await api.get(endpoint);
        console.log('Response received:', response.status);
        
        // Extract the data from the response
        if (response.data && response.data.data) {
          const rawData = response.data.data;
          console.log('Raw data:', rawData);
          
          // Skip conversion for items endpoint
          if (endpoint === endpoints.items) {
            return rawData;
          }
          
          // Convert object to array if needed
          const dataArray = Object.values(rawData);
          console.log('Converted to array:', dataArray);
          
          return dataArray;
        }
        
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', {
          endpoint,
          status: error.response?.status,
          message: error.message,
          response: error.response?.data
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data becomes stale after 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes - cache is kept for 10 minutes
    refetchInterval: 4.5 * 60 * 1000, // 4.5 minutes - refetch 30 seconds before data becomes stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}; 