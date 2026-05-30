import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { registerUser } from '../api/auth'

import { activityOptions } from '../utils/activity'
import { cities } from '../utils/cities'

import '../styles/auth.css'

export default function RegisterDetailsPage() {
  const navigate = useNavigate()

  const step1 = JSON.parse(
    localStorage.getItem('register_step_1')
  )

  const [form, setForm] = useState({
    city: '',
    height: '',
    weight: '',
    birth_date: '',
    activity_level: 'medium'
  })

  const handleRegister = async () => {
    try {
      const payload = {
        ...step1,

        city: form.city,
        height: Number(form.height),
        weight: Number(form.weight),
        birth_date: form.birth_date,
        activity_level: form.activity_level
      }

      const data = await registerUser(payload)

      localStorage.setItem(
        'access_token',
        data.access_token
      )

      localStorage.setItem(
        'refresh_token',
        data.refresh_token
      )

      navigate('/')
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Ошибка регистрации'
      )
    }
  }

  return (
    <div
      className="auth-page"
      style={{
        backgroundImage: 'url(/bg-auth.jpg)'
      }}
    >
      <div className="auth-card">
        <h1 className="auth-title">
          Дополнительная информация
        </h1>

        <div className="auth-form">
          <select
            className="auth-input"
            value={form.city}
            onChange={(e) =>
              setForm({
                ...form,
                city: e.target.value
              })
            }
          >
            <option value="">
              Выберите город
            </option>

            {cities.map((city) => (
              <option
                key={city}
                value={city}
              >
                {city}
              </option>
            ))}
          </select>

          <input
            className="auth-input"
            placeholder="Рост"
            type="number"
            value={form.height}
            onChange={(e) =>
              setForm({
                ...form,
                height: e.target.value
              })
            }
          />

          <input
            className="auth-input"
            placeholder="Вес"
            type="number"
            value={form.weight}
            onChange={(e) =>
              setForm({
                ...form,
                weight: e.target.value
              })
            }
          />

          <input
            className="auth-input"
            type="date"
            value={form.birth_date}
            onChange={(e) =>
              setForm({
                ...form,
                birth_date: e.target.value
              })
            }
          />

          <select
            className="auth-input"
            value={form.activity_level}
            onChange={(e) =>
              setForm({
                ...form,
                activity_level: e.target.value
              })
            }
          >
            {activityOptions.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>

          <button
            className="main-button"
            onClick={handleRegister}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  )
}