import api from './axios'

export const getSPF = async () => {
  const { data } =
    await api.get('/spf')

  return data
}