import api from './axios';

// Аналитика воды
export const getWaterAnalytics = async (type, period, endDate) => {
  const { data } = await api.get('/analytics/water', {
    params: {
      type,
      period,
      end_date: endDate
    }
  });
  return data;
};

// Аналитика выполнения рутины
export const getRoutineAnalytics = async (type, period, endDate) => {
  const { data } = await api.get('/analytics/routine', {
    params: {
      type,
      period,
      end_date: endDate
    }
  });
  return data;
};

// Аналитика состояния кожи (общая оценка)
export const getSkinAnalytics = async (period, endDate) => {
  const { data } = await api.get('/analytics/skin', {
    params: {
      period,
      end_date: endDate
    }
  });
  return data;
};

// Аналитика реакций кожи (по группам)
export const getReactionGroupsAnalytics = async (period, endDate) => {
  const { data } = await api.get('/analytics/reaction-groups', {
    params: {
      period,
      end_date: endDate
    }
  });
  return data;
};