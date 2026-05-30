import { useNavigate } from 'react-router-dom'

import '../styles/auth.css'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="home-top">
        <img
          src="/sakura.png"
          alt="sakura"
          className="sakura-image"
        />
      </div>

      <div className="home-content">
        <h1 className="home-title">Glow</h1>

        <p className="home-subtitle">
          Трекер рутин, воды и привычек
        </p>

        <button
          className="main-button"
          onClick={() => navigate('/register')}
        >
          Начать
        </button>
      </div>
    </div>
  )
}