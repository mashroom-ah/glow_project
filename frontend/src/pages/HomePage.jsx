import { useNavigate } from 'react-router-dom'

import '../styles/auth.css'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-wrapper">
        <div className="home-top">
          <img
            src="/sakura.png"
            alt="sakura"
            className="sakura-image"
          />
        </div>

        <div className="home-content">
          <div className="home-text-block">
            <h1 className="home-title">
              Glow
            </h1>

            <p className="home-subtitle">
              Приложение для ухода за
              кожей. Выстраивай
              рутину, отслеживай
              реакции, не пропускай
              ритуалы — и сияй каждый
              день.
            </p>
          </div>

          <button
            className="main-button"
            onClick={() =>
              navigate('/register')
            }
          >
            Начать
          </button>
        </div>
      </div>
    </div>
  )
}