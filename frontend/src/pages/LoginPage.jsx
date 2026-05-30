import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { loginUser } from '../api/auth'

import '../styles/auth.css'

export default function LoginPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async () => {
    try {
      const data = await loginUser(form)

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
          'Ошибка входа'
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
          Вход
        </h1>

        <div className="auth-form">
          <input
            className="auth-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />

          <button
            className="main-button"
            onClick={handleLogin}
          >
            Войти
          </button>

          <div
            className="auth-link"
            onClick={() => navigate('/register')}
          >
            Нет аккаунта? <span>Создать</span>
          </div>
        </div>
      </div>
    </div>
  )
}