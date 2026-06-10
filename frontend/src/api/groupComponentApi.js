import api from './axios'

// Получить все продукты (для поиска по компонентам)
export const getAllProducts = async () => {
  const { data } = await api.get('/products')
  return data
}

// Получить активные компоненты для группы по названию группы
export const getComponentsByGroup = async (groupName) => {
  const { data } = await api.get('/group-component/by-group', {
    params: { group_name: groupName }
  })
  return data
}