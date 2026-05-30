import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import '../styles/auth.css'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleNext = () => {
    localStorage.setItem(
      'register_step_1',
      JSON.stringify(form)
    )

    navigate('/register/details')
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
          Регистрация
        </h1>

        <div className="auth-form">
          <input
            className="auth-input"
            placeholder="Имя"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
          />

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
            onClick={handleNext}
          >
            Продолжить
          </button>

          <div
            className="auth-link"
            onClick={() => navigate('/login')}
          >
            Есть аккаунт? <span>Войти</span>
          </div>
        </div>
      </div>
    </div>
  )
}