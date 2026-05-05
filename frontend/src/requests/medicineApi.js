import api from './index';

export const searchMedicines = async (query) => {
  try {
    const response = await api.get('/medicines/search', { params: { q: query } });
    return response.data.items || [];
  } catch (error) {
    console.error('Error searching medicines:', error);
    return [];
  }
};

export const getMedicineById = async (id) => {
  try {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medicine details:', error);
    return null;
  }
};

export default api;
