import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoutines, deleteRoutine } from '../api/routineApi'
import '../styles/constructor.css'

// Переводы названий продуктов
const productNameRu = {
  'Foam Cleanser': 'Пенка для умывания',
  'Gel Cleanser': 'Гель для умывания',
  'Moisturizing Cream': 'Увлажняющий крем',
  'Hydrating Toner': 'Увлажняющий тонер',
  'Barrier Serum': 'Восстанавливающая сыворотка',
  'Acid Toner': 'Кислотный тонер',
  'BHA Pads': 'BHA-пэды',
  'Retinol Serum': 'Сыворотка с ретинолом',
  'Azelaic Acid Serum': 'Сыворотка с азелаиновой кислотой',
  'Calming Mask': 'Успокаивающая маска',
  'Recovery Cream': 'Восстанавливающий крем',
  'Basic SPF Cream': 'Базовый SPF-крем',
  'Basic Cleanser': 'Базовый очищающий гель'
}

const routineTypeRu = {
  morning: 'Утро',
  evening: 'Вечер',
  universal: 'Универсальная'
}

const frequencyRu = {
  daily: 'каждый день',
  weekly: (value) => {
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
    return `раз в неделю (${days[value] || `день ${value}`})`
  },
  every_n_days: (value) => `каждые ${value} ${value === 1 ? 'день' : 'дней'}`
}

export default function ConstructorPage() {
  const navigate = useNavigate()
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRoutines = async () => {
    try {
      setLoading(true)
      const data = await getRoutines()
      setRoutines(data || [])
    } catch (err) {
      console.error(err)
      setError('Не удалось загрузить рутины')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutines()
  }, [])

  const handleDelete = async (routineId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту рутину?')) return
    try {
      await deleteRoutine(routineId)
      await loadRoutines()
    } catch (err) {
      console.error(err)
      alert('Ошибка при удалении рутины')
    }
  }

  const handleEdit = (routine) => {
    navigate(`/constructor/edit/${routine.routine_id}`, { state: { routine } })
  }

  const handleCreate = (type) => {
    navigate(`/constructor/create`, { state: { routineType: type } })
  }

  const hasMorning = routines.some(r => r.routine_type === 'morning')
  const hasEvening = routines.some(r => r.routine_type === 'evening')
  const hasUniversal = routines.some(r => r.routine_type === 'universal')

  const canAddMorning = !hasMorning && !hasUniversal
  const canAddEvening = !hasEvening && !hasUniversal
  const canAddUniversal = !hasUniversal && !hasMorning && !hasEvening

  const getRoutineByType = (type) => routines.find(r => r.routine_type === type)

  if (loading) {
    return (
      <div className="constructor-page">
        <div className="constructor-container">
          <div className="loading">Загрузка...</div>
          <nav className="bottom-nav">
            <button className="nav-item active-nav"><img src="/icons/constructor.svg" alt="constructor" /></button>
            <button className="nav-item" onClick={() => navigate('/water')}><img src="/icons/water.svg" alt="water" /></button>
            <button className="nav-item" onClick={() => navigate('/main')}><img src="/icons/home.svg" alt="home" /></button>
            <button className="nav-item" onClick={() => navigate('/analytics')}><img src="/icons/chart.svg" alt="chart" /></button>
            <button className="nav-item" onClick={() => navigate('/profile')}><img src="/icons/profile.svg" alt="profile" /></button>
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div className="constructor-page">
      <div className="constructor-container">
        <h1 className="constructor-title">Мои рутины</h1>

        {error && <div className="error-message">{error}</div>}

        <RoutineSection
          title={routineTypeRu.morning}
          routine={getRoutineByType('morning')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => handleCreate('morning')}
          showAddButton={canAddMorning}
        />

        <RoutineSection
          title={routineTypeRu.evening}
          routine={getRoutineByType('evening')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => handleCreate('evening')}
          showAddButton={canAddEvening}
        />

        <RoutineSection
          title={routineTypeRu.universal}
          routine={getRoutineByType('universal')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => handleCreate('universal')}
          showAddButton={canAddUniversal}
        />

        <nav className="bottom-nav">
          <button className="nav-item active-nav"><img src="/icons/constructor.svg" alt="constructor" /></button>
          <button className="nav-item" onClick={() => navigate('/water')}><img src="/icons/water.svg" alt="water" /></button>
          <button className="nav-item" onClick={() => navigate('/main')}><img src="/icons/home.svg" alt="home" /></button>
          <button className="nav-item" onClick={() => navigate('/analytics')}><img src="/icons/chart.svg" alt="chart" /></button>
          <button className="nav-item" onClick={() => navigate('/profile')}><img src="/icons/profile.svg" alt="profile" /></button>
        </nav>
      </div>
    </div>
  )
}

function RoutineSection({ title, routine, onEdit, onDelete, onAdd, showAddButton }) {
  if (!routine) {
    return (
      <div className="routine-section">
        <div className="routine-header">
          <h2>{title}</h2>
        </div>
        {showAddButton && (
          <button className="add-routine-btn" onClick={onAdd}>
            + Добавить
          </button>
        )}
        {!showAddButton && (
          <div className="empty-routine">Нельзя добавить (уже есть универсальная или другая рутина)</div>
        )}
      </div>
    )
  }

  const steps = [...routine.steps].sort((a, b) => a.step_order - b.step_order)

  const getFrequencyText = (step) => {
    if (step.frequency_type === 'daily') return frequencyRu.daily
    if (step.frequency_type === 'weekly') return frequencyRu.weekly(step.frequency_value)
    if (step.frequency_type === 'every_n_days') return frequencyRu.every_n_days(step.frequency_value)
    return 'неизвестно'
  }

  const translateProductName = (engName) => productNameRu[engName] || engName

  const stepColors = ['#FCE68F', '#F3BCBE', '#CDBCDB', '#D6DC82', '#FFAB86', '#C2CEDF', '#7881BB']

  return (
    <div className="routine-section">
      <div className="routine-header">
        <h2>{title}</h2>
      </div>

      <div className="routine-steps-list">
        {steps.map((step, idx) => {
          const translatedProduct = translateProductName(step.product.product_name)
          const bgColor = stepColors[idx % stepColors.length]

          return (
            <div key={step.routine_step_id} className="step-item">
              <div className="step-number">Шаг {step.step_order}</div>
              <div className="step-row">
                <div className="step-product-card" style={{ backgroundColor: bgColor }}>
                  <div className="step-product-name">{translatedProduct}</div>
                </div>
                <div className="step-frequency-info">
                  <div className="frequency-label">Частота:</div>
                  <div className="frequency-value">{getFrequencyText(step)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="routine-actions">
        <button className="delete-btn" onClick={() => onDelete(routine.routine_id)}>Удалить</button>
        <button className="edit-btn" onClick={() => onEdit(routine)}>Изменить</button>
      </div>
    </div>
  )
}