import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getMe,
  logout,
  updateProfile,
} from '../api/profileApi'

import {
  archiveItem,
  createItem,
  deleteItem,
  getItems,
  restoreItem,
  updateItem,
} from '../api/itemApi'

import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../api/notificationApi'

import { cities } from '../utils/cities' // импортируем список городов
import '../styles/profile.css'

const activityRu = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
}

const statusRu = {
  fresh: 'годен',
  expiring_soon: 'истекает скоро',
  expiring: 'истекает',
  expired: 'просрочен',
}

const statusColor = {
  fresh: '#2DBE60',
  expiring_soon: '#F0D264',
  expiring: '#F5A623',
  expired: '#EA4D4D',
}

export default function ProfilePage() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [items, setItems] = useState([])
  const [notificationSettings, setNotificationSettings] = useState(null)
  const [openedSettings, setOpenedSettings] = useState(false)
  const [openedItemModal, setOpenedItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [form, setForm] = useState({
    name: '',
    city: '',
    height: '',
    weight: '',
    birth_date: '',
    activity_level: 'medium',
  })

  const [itemForm, setItemForm] = useState({
    name: '',
    production_date: '',
    shelf_life_closed: '',
    shelf_life_open: '',
    opened_at: '',
  })

  const loadPage = async () => {
    try {
      const [profileData, itemsData, settingsData] = await Promise.all([
        getMe(),
        getItems(),
        getNotificationSettings(),
      ])
      setProfile(profileData)
      setItems(itemsData)
      setNotificationSettings(settingsData)
      localStorage.setItem('profile_cache', JSON.stringify(profileData))
      localStorage.setItem('items_cache', JSON.stringify(itemsData))
      setForm({
        name: profileData.name || '',
        city: profileData.city || '',
        height: profileData.height || '',
        weight: profileData.weight || '',
        birth_date: profileData.birth_date || '',
        activity_level: profileData.activity_level || 'medium',
      })
    } catch (error) {
      console.log(error)
      const cachedProfile = localStorage.getItem('profile_cache')
      const cachedItems = localStorage.getItem('items_cache')
      if (cachedProfile) setProfile(JSON.parse(cachedProfile))
      if (cachedItems) setItems(JSON.parse(cachedItems))
    }
  }

  useEffect(() => {
    loadPage()
  }, [])

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.is_active && !b.is_active) return -1
      if (!a.is_active && b.is_active) return 1
      return 0
    })
  }, [items])

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.clear()
      navigate('/login')
    } catch (error) {
      console.log(error)
    }
  }

  const handleProfileSave = async () => {
    try {
      await updateProfile(form)
      setOpenedSettings(false)
      loadPage()
    } catch (error) {
      console.log(error)
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setItemForm({
      name: '',
      production_date: '',
      shelf_life_closed: '',
      shelf_life_open: '',
      opened_at: '',
    })
    setOpenedItemModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setItemForm({
      name: item.name || '',
      production_date: item.production_date || '',
      shelf_life_closed: item.shelf_life_closed || '',
      shelf_life_open: item.shelf_life_open || '',
      opened_at: item.opened_at || '',
    })
    setOpenedItemModal(true)
  }

  const handleSaveItem = async () => {
    if (!itemForm.name.trim()) {
      alert('Введите название продукта')
      return
    }
    if (!itemForm.production_date) {
      alert('Укажите дату производства')
      return
    }
    const shelfLifeClosed = parseInt(itemForm.shelf_life_closed, 10)
    if (!itemForm.shelf_life_closed || isNaN(shelfLifeClosed) || shelfLifeClosed <= 0) {
      alert('Укажите срок годности закрытого (дней) – положительное число')
      return
    }

    try {
      const payload = {
        name: itemForm.name.trim(),
        production_date: itemForm.production_date,
        shelf_life_closed: shelfLifeClosed,
        shelf_life_open: itemForm.shelf_life_open ? parseInt(itemForm.shelf_life_open, 10) : null,
        opened_at: itemForm.opened_at || null,
      }
      if (editingItem) {
        await updateItem(editingItem.item_id, payload)
      } else {
        await createItem(payload)
      }
      setOpenedItemModal(false)
      loadPage()
    } catch (error) {
      console.error('Ошибка сохранения продукта:', error)
      alert(error?.response?.data?.message || 'Ошибка сохранения продукта')
    }
  }

  const handleDelete = async () => {
    if (!editingItem) return
    try {
      await deleteItem(editingItem.item_id)
      setOpenedItemModal(false)
      loadPage()
    } catch (error) {
      console.log(error)
    }
  }

  const toggleArchive = async (item) => {
    try {
      if (item.is_active) {
        await archiveItem(item.item_id)
      } else {
        await restoreItem(item.item_id)
      }
      loadPage()
    } catch (error) {
      console.error('Ошибка архивации/восстановления:', error)
      alert(error?.response?.data?.message || 'Ошибка изменения статуса продукта')
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-top">
          <button className="logout-button" onClick={handleLogout}>
            <img src="/icons/logout.svg" alt="logout" />
          </button>
          <h1>Аккаунт</h1>
        </div>

        <div className="profile-card">
          <button className="settings-button" onClick={() => setOpenedSettings(true)}>
            <img src="/icons/settings.svg" alt="settings" />
          </button>
          <div className="profile-name">{profile?.name}</div>
          <div className="profile-email">{profile?.email}</div>
        </div>

        <div className="products-header">
          <span>Мои продукты</span>
          <button onClick={openCreateModal}>
            <img src="/icons/plus.svg" alt="plus" />
          </button>
        </div>

        <div className="product-list">
          {sortedItems.map((item) => (
            <div
              key={item.item_id}
              className={`product-card ${!item.is_active ? 'archived' : ''}`}
            >
              <button className="archive-button" onClick={() => toggleArchive(item)}>
                <img src="/icons/archive.svg" alt="archive" />
              </button>
              <div className="product-title">{item.name}</div>
              <div className="product-bottom">
                <div className="product-status">
                  <span className="status-dot" style={{ background: statusColor[item.status] }} />
                  <span>Статус: {statusRu[item.status]}</span>
                </div>
                <button className="edit-button" onClick={() => openEditModal(item)}>
                  <img src="/icons/edit.svg" alt="edit" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <nav className="bottom-nav">
          <button className="nav-item" onClick={() => navigate('/constructor')}>
            <img src="/icons/constructor.svg" alt="" />
          </button>
          <button className="nav-item" onClick={() => navigate('/water')}>
            <img src="/icons/water.svg" alt="" />
          </button>
          <button className="nav-item" onClick={() => navigate('/main')}>
            <img src="/icons/home.svg" alt="" />
          </button>
          <button className="nav-item" onClick={() => navigate('/analytics')}>
            <img src="/icons/chart.svg" alt="" />
          </button>
          <button className="nav-item active-nav">
            <img src="/icons/profile.svg" alt="" />
          </button>
        </nav>
      </div>

      {/* Модалка настроек */}
      {openedSettings && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <h2>Настройки профиля</h2>
            <div className="form-group">
              <label>Имя</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Город</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="auth-select"
              >
                <option value="">Выберите город</option>
                {cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Рост</label>
                <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Вес</label>
                <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Дата рождения</label>
              <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Активность</label>
              <select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })}>
                <option value="low">Низкая</option>
                <option value="medium">Средняя</option>
                <option value="high">Высокая</option>
              </select>
            </div>

            {notificationSettings && (
              <>
                <div className="settings-divider" />
                <h3>Уведомления</h3>
                <div className="switch-row">
                  <span>Push уведомления</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.push_enabled}
                    onChange={async (e) => {
                      const body = { push_enabled: e.target.checked }
                      setNotificationSettings({ ...notificationSettings, ...body })
                      await updateNotificationSettings(body)
                    }}
                  />
                </div>
                <div className="switch-row">
                  <span>Утренние уведомления</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.morning_enabled}
                    onChange={async (e) => {
                      const body = { morning_enabled: e.target.checked }
                      setNotificationSettings({ ...notificationSettings, ...body })
                      await updateNotificationSettings(body)
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Время утреннего уведомления</label>
                  <input
                    type="time"
                    value={notificationSettings.morning_time || ''}
                    onChange={async (e) => {
                      const body = { morning_time: e.target.value }
                      setNotificationSettings({ ...notificationSettings, ...body })
                      await updateNotificationSettings(body)
                    }}
                  />
                </div>
                <div className="switch-row">
                  <span>Вечерние уведомления</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.evening_enabled}
                    onChange={async (e) => {
                      const body = { evening_enabled: e.target.checked }
                      setNotificationSettings({ ...notificationSettings, ...body })
                      await updateNotificationSettings(body)
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Время вечернего уведомления</label>
                  <input
                    type="time"
                    value={notificationSettings.evening_time || ''}
                    onChange={async (e) => {
                      const body = { evening_time: e.target.value }
                      setNotificationSettings({ ...notificationSettings, ...body })
                      await updateNotificationSettings(body)
                    }}
                  />
                </div>
                {/* Убираем поле часового пояса */}
              </>
            )}

            <div className="modal-actions">
              <button onClick={() => setOpenedSettings(false)}>Закрыть</button>
              <button onClick={handleProfileSave}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка продукта */}
      {openedItemModal && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <h2>{editingItem ? 'Редактировать продукт' : 'Добавить продукт'}</h2>
            <div className="form-group">
              <label>Название</label>
              <input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Дата производства</label>
              <input type="date" value={itemForm.production_date} onChange={(e) => setItemForm({ ...itemForm, production_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Срок годности закрытого (дней)</label>
              <input type="number" value={itemForm.shelf_life_closed} onChange={(e) => setItemForm({ ...itemForm, shelf_life_closed: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Срок после открытия (дней)</label>
              <input type="number" value={itemForm.shelf_life_open} onChange={(e) => setItemForm({ ...itemForm, shelf_life_open: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Дата открытия</label>
              <input type="date" value={itemForm.opened_at} onChange={(e) => setItemForm({ ...itemForm, opened_at: e.target.value })} />
            </div>
            <div className="modal-actions">
              {editingItem && <button className="delete-button" onClick={handleDelete}>Удалить</button>}
              <button onClick={() => setOpenedItemModal(false)}>Закрыть</button>
              <button onClick={handleSaveItem}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}