import api from './axios';

export const getTodayWater = async () => {
  const { data } = await api.get('/water/today');
  return data;
};

export const addWater = async (amount_ml) => {
  const { data } = await api.post('/water/add', { amount_ml });
  return data;
};

export const removeWater = async (amount_ml) => {
  const { data } = await api.post('/water/subtract', { amount_ml });
  return data;
};