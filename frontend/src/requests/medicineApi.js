import axios from 'axios';

const MEDICINE_API_BASE_URL = 'https://medicament-api.vercel.app/api';

const medicineApi = axios.create({
  baseURL: MEDICINE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const searchMedicines = async (query) => {
  try {
    // We perform two requests in parallel to search by Name OR Ingredient (DCI)
    const [nameRes, dciRes] = await Promise.all([
      medicineApi.get('/medicaments', { params: { nom: query, limit: 15 } }),
      medicineApi.get('/medicaments', { params: { dci1: query, limit: 15 } })
    ]);

    const nameItems = nameRes.data.items || [];
    const dciItems = dciRes.data.items || [];

    // Merge and remove duplicates by ID
    const combined = [...nameItems, ...dciItems];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

    return unique.slice(0, 20); // Return top 20 unique results
  } catch (error) {
    console.error('Error searching medicines:', error);
    return [];
  }
};

export const getMedicineById = async (id) => {
  try {
    const response = await medicineApi.get(`/medicaments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medicine details:', error);
    return null;
  }
};

export default medicineApi;
