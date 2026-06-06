import api from './axios'

export const getItems =
  async () => {
    const { data } =
      await api.get('/item')

    localStorage.setItem(
      'items_cache',
      JSON.stringify(data)
    )

    return data
  }

export const createItem =
  async (body) => {
    const { data } =
      await api.post(
        '/item',
        body
      )

    return data
  }

export const updateItem =
  async (id, body) => {
    const { data } =
      await api.put(
        `/item/${id}`,
        body
      )

    return data
  }

export const archiveItem =
  async (id) => {
    const { data } =
      await api.patch(
        `/item/${id}/archive`
      )

    return data
  }

export const restoreItem =
  async (id) => {
    const { data } =
      await api.patch(
        `/item/${id}/restore`
      )

    return data
  }

export const deleteItem =
  async (id) => {
    const { data } =
      await api.delete(
        `/item/${id}`
      )

    return data
  }