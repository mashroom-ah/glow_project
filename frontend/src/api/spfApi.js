import api from './api'

export const getSPF = async () => {
  const { data } =
    await api.get('/spf')

  return data
}