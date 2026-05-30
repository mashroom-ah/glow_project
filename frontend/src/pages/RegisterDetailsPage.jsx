import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { activityOptions } from '../utils/activity'
import { cities } from '../utils/cities'
import '../styles/auth.css'

export default function RegisterDetailsPage() {
  const navigate = useNavigate()
  const step1 = JSON.parse(localStorage.getItem('register_step_1'))

  if (!step1) {
    navigate('/register')
    return null
  }

  const [form, setForm] = useState({
    city: '',
    height: '',
    weight: '',
    birth_date: '',
    activity_level: 'medium',
  })

  const validate = () => {
    const { city, height, weight, birth_date } = form
    if (!city.trim()) {
      alert('Выберите город')
      return false
    }
    if (!height.trim() || isNaN(Number(height)) || Number(height) <= 0) {
      alert('Введите корректный рост (положительное число)')
      return false
    }
    if (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0) {
      alert('Введите корректный вес (положительное число)')
      return false
    }
    if (!birth_date.trim()) {
      alert('Укажите дату рождения')
      return false
    }
    return true
  }

  const handleRegister = async () => {
    if (!validate()) return
    try {
      const payload = {
        ...step1,
        city: form.city,
        height: Number(form.height),
        weight: Number(form.weight),
        birth_date: form.birth_date,
        activity_level: form.activity_level,
      }
      const data = await registerUser(payload)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      navigate('/')
    } catch (error) {
      if (error?.response?.data?.errors) {
        alert(error.response.data.errors[0].message)
        return
      }
      alert(error?.response?.data?.message || 'Ошибка регистрации')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-page-title">Информация о себе</h1>
        <div className="auth-card">
          <div className="auth-form">
            <div className="input-group">
              <label className="input-label">Город</label>
              <select
                className="auth-input auth-select"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                <option value="">Выберите город</option>
                {cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Рост (см)</label>
              <input
                className="auth-input"
                type="number"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Вес (кг)</label>
              <input
                className="auth-input"
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Дата рождения</label>
              <input
                className="auth-input"
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Уровень активности</label>
              <select
                className="auth-input auth-select"
                value={form.activity_level}
                onChange={(e) => setForm({ ...form, activity_level: e.target.value })}
              >
                {activityOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <button className="main-button" onClick={handleRegister}>Подтвердить</button>
          </div>
        </div>
      </div>
    </div>
  )
}