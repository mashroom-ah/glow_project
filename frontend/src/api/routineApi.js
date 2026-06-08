import api from './axios'

export const getStreak = async () => {
  const { data } = await api.get('/streak')
  return data
}

export const getRoutines = async () => {
  const { data } = await api.get('/routines')
  return data
}

export const getRoutineLogsByDate = async (date) => {
  const { data } = await api.get(`/routine-log/date/${date}`)
  return data
}

export const getRoutinesByDate = async (date) => {
  const { data } = await api.get(`/routines/date/${date}`)
  return data
}

export const createRoutine = async (body) => {
  const { data } = await api.post('/routines', body)
  return data
}

export const updateRoutine = async (id, body) => {
  const { data } = await api.put(`/routines/${id}`, body)
  return data
}

export const deleteRoutine = async (id) => {
  const { data } = await api.delete(`/routines/${id}`)
  return data
}

export const createRoutineLog = async (body) => {
  const { data } = await api.post('/routine-log', body)
  return data
}

export const updateRoutineLog = async (id, body) => {
  const { data } = await api.put(`/routine-log/${id}`, body)
  return data
}

export const getSkinReactions = async () => {
  try {
    const cached = localStorage.getItem('skin_reactions')
    if (cached) {
      return { reactions: JSON.parse(cached) }
    }
    const { data } = await api.get('/skin-reactions')
    localStorage.setItem('skin_reactions', JSON.stringify(data.reactions || []))
    return data
  } catch (error) {
    const cached = localStorage.getItem('skin_reactions')
    return { reactions: cached ? JSON.parse(cached) : [] }
  }
}

// Получить все группы продуктов
export const getProductGroups = async () => {
  const { data } = await api.get('/product-groups')
  return data
}

// Получить продукты по группе (или все, если group_id не указан)
export const getProductsByGroup = async (groupId) => {
  const params = groupId ? { group_id: groupId } : {}
  const { data } = await api.get('/products', { params })
  return data
}

// Проверить валидность рутины (шагов)
export const validateRoutine = async (steps) => {
  const { data } = await api.post('/routines/validate', { steps })
  return data
}

// Обновлённый createRoutine / updateRoutine (принимают объект с steps)
export const createRoutine = async (routineType, steps) => {
  const { data } = await api.post('/routines', {
    routine_type: routineType,
    steps: steps.map((step, idx) => ({
      product_id: step.product_id,
      step_order: idx + 1,
      frequency_type: step.frequency_type,
      frequency_value: step.frequency_value || 0
    }))
  })
  return data
}

export const updateRoutine = async (routineId, routineType, steps) => {
  const { data } = await api.put(`/routines/${routineId}`, {
    routine_type: routineType,
    steps: steps.map((step, idx) => ({
      product_id: step.product_id,
      step_order: idx + 1,
      frequency_type: step.frequency_type,
      frequency_value: step.frequency_value || 0
    }))
  })
  return data
}