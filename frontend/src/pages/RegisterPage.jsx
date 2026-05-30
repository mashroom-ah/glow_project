import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/auth.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const validate = () => {
    const { name, email, password } = form
    if (!name.trim() || !email.trim() || !password.trim()) {
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

  const handleNext = () => {
    if (!validate()) return
    localStorage.setItem('register_step_1', JSON.stringify(form))
    navigate('/register/details')
  }

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-page-title">Регистрация</h1>
        <div className="auth-card">
          <div className="auth-form">
            <div className="input-group">
              <label className="input-label">Имя</label>
              <input
                className="auth-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
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
            <button className="main-button" onClick={handleNext}>Продолжить</button>
            <div className="auth-link" onClick={() => navigate('/login')}>
              Есть аккаунт?
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}