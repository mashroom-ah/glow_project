import api from './axios'

export const getStreak = async () => {
  const { data } = await api.get('/streak')

  return data
}

export const getRoutines = async () => {
  const { data } = await api.get('/routines')

  return data
}

export const getRoutineLogsByDate = async (
  date
) => {
  const { data } = await api.get(
    `/routine-log/date/${date}`
  )

  return data
}

export const getRoutinesByDate = async (
  date
) => {
  const { data } = await api.get(
    `/routines/date/${date}`
  )

  return data
}

export const createRoutineLog = async (
  body
) => {
  const { data } = await api.post(
    '/routine-log',
    body
  )

  return data
}

export const updateRoutineLog = async (
  id,
  body
) => {
  const { data } = await api.put(
    `/routine-log/${id}`,
    body
  )

  return data
}

export const getSkinReactions =
  async () => {
    try {
      const cached =
        localStorage.getItem(
          'skin_reactions'
        )

      if (cached) {
        return {
          reactions:
            JSON.parse(cached),
        }
      }

      const { data } = await api.get(
        '/skin-reactions'
      )

      localStorage.setItem(
        'skin_reactions',
        JSON.stringify(
          data.reactions || []
        )
      )

      return data
    } catch (error) {
      const cached =
        localStorage.getItem(
          'skin_reactions'
        )

      return {
        reactions: cached
          ? JSON.parse(cached)
          : [],
      }
    }
  }