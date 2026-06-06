import api from './axios'

export const getMe = async () => {
  const { data } = await api.get(
    '/user/me'
  )

  localStorage.setItem(
    'profile_cache',
    JSON.stringify(data)
  )

  return data
}

export const updateProfile =
  async (body) => {
    const { data } =
      await api.put(
        '/user/profile',
        body
      )

    return data
  }

export const logout = async () => {
  const { data } =
    await api.post(
      '/auth/logout'
    )

  localStorage.removeItem(
    'access_token'
  )

  localStorage.removeItem(
    'profile_cache'
  )

  return data
}