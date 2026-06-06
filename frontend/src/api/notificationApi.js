import api from './axios'

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