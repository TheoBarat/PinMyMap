import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Récupérer l'état des pays d'un utilisateur
export const fetchCountryStates = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/countries/${userId}`);
  return response.data;
};

// Mettre à jour l'état d'un pays pour un utilisateur
export const updateCountryState = async (userId, countryCode, state) => {
  const response = await axios.post(`${API_BASE_URL}/country/update`, {
    userId,
    countryCode,
    state,
  });
  return response.data;
};
