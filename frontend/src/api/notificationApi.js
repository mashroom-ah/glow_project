import api from './axios'

export const subscribeToPush = async (subscription) => {
  const { data } = await api.post('/notifications/subscriptions', subscription);
  return data;
};

export const unsubscribeFromPush = async (endpoint) => {
  const { data } = await api.delete('/notifications/subscriptions', { data: { endpoint } });
  return data;
};

export const getNotificationSettings =
  async () => {
    const { data } =
      await api.get(
        '/notifications/settings'
      )

    return data
  }

export const updateNotificationSettings =
  async (body) => {
    const { data } =
      await api.patch(
        '/notifications/settings',
        body
      )

    return data
  }