import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth'
import '../styles/auth.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const validate = () => {
    const { email, password } = form
    if (!email.trim() || !password.trim()) {
      alert('Заполните все поля')
      return false
    }
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Введите корректный email')
      return false
    }
    if (password.length < 8) {
      alert('Пароль должен содержать не менее 8 символов')
      return false
    }
    return true
  }

  const handleLogin = async () => {
    if (!validate()) return
    try {
      const data = await loginUser(form)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      navigate('/')
    } catch (error) {
      alert(error?.response?.data?.message || 'Ошибка входа')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-page-title">Вход в аккаунт</h1>
        <div className="auth-card">
          <div className="auth-form">
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className="auth-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Пароль</label>
              <input
                className="auth-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="main-button" onClick={handleLogin}>Войти</button>
            <div className="auth-link" onClick={() => navigate('/register')}>
              Нет аккаунта?
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}