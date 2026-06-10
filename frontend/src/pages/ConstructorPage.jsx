import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoutines, deleteRoutine } from '../api/routineApi'
import '../styles/constructor.css'

const productNameRu = {
  'Foam Cleanser': 'Пенка для умывания',
  'Gel Cleanser': 'Гель для умывания',
  'Cream Gel Cleanser': 'Крем-гель для умывания',
  'Hydrophilic Oil': 'Гидрофильное масло',
  'Micellar Water': 'Мицелярная вода',
  'Basic Cleanser': 'Базовый очищающий гель',
  'Cream': 'Крем',
  'Serum': 'Сыворотка',
  'Essence': 'Эссенция',
  'Toner': 'Тонер',
  'Mask': 'Маска',
  'Moisturizing Cream': 'Увлажняющий крем',
  'Hydrating Toner': 'Увлажняющий тонер',
  'Barrier Serum': 'Восстанавливающая сыворотка',
  'Basic SPF Cream': 'Базовый SPF-крем',
  'Peeling Solution': 'Пилинг-раствор',
  'Pads': 'Пэды',
  'Scrub': 'Скраб',
  'Enzyme Powder': 'Энзимная пудра',
  'Acid Toner': 'Кислотный тонер',
  'BHA Pads': 'BHA-пэды',
  'Spot Treatment': 'Точечное средство',
  'Retinol Serum': 'Сыворотка с ретинолом',
  'Azelaic Acid Serum': 'Сыворотка с азелаином',
  'Night Cream': 'Ночной крем',
  'Anti Age Serum': 'Антивозрастная сыворотка',
  'Eye Cream': 'Крем для глаз',
  'Masks': 'Маски',
  'Calming Mask': 'Успокаивающая маска',
  'Recovery Cream': 'Восстанавливающий крем'
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

const templates = {
  morning: {
    name: 'Базовое утро',
    steps: [
      { product_name: 'Foam Cleanser', frequency_type: 'daily', frequency_value: 0 },
      { product_name: 'Cream', frequency_type: 'daily', frequency_value: 0 },
      { product_name: 'Essence', frequency_type: 'daily', frequency_value: 0 }
    ]
  },
  evening: {
    name: 'Базовый вечер',
    steps: [
      { product_name: 'Gel Cleanser', frequency_type: 'daily', frequency_value: 0 },
      { product_name: 'Anti Age Serum', frequency_type: 'weekly', frequency_value: 1 },
      { product_name: 'Calming Mask', frequency_type: 'weekly', frequency_value: 4 }
    ]
  },
  universal: {
    name: 'Универсальная',
    steps: [
      { product_name: 'Cream', frequency_type: 'daily', frequency_value: 0 },
      { product_name: 'Essence', frequency_type: 'daily', frequency_value: 0 }
    ]
  }
}

// Вспомогательная функция: отрезает компонент в скобках и переводит базовое имя
const translateProduct = (fullName) => {
  const baseName = fullName.split(' (')[0]
  return productNameRu[baseName] || baseName
}

export default function ConstructorPage() {
  const navigate = useNavigate()
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedType, setSelectedType] = useState(null)

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

  const handleCreateClick = (type) => {
    setSelectedType(type)
    setShowTemplateModal(true)
  }

  const selectTemplate = () => {
    setShowTemplateModal(false)
    navigate('/constructor/create', {
      state: {
        routineType: selectedType,
        template: templates[selectedType]
      }
    })
  }

  const selectEmpty = () => {
    setShowTemplateModal(false)
    navigate('/constructor/create', {
      state: {
        routineType: selectedType,
        template: null
      }
    })
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
          onAdd={() => handleCreateClick('morning')}
          showAddButton={canAddMorning}
        />

        <RoutineSection
          title={routineTypeRu.evening}
          routine={getRoutineByType('evening')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => handleCreateClick('evening')}
          showAddButton={canAddEvening}
        />

        <RoutineSection
          title={routineTypeRu.universal}
          routine={getRoutineByType('universal')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => handleCreateClick('universal')}
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

      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="template-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Выберите шаблон</h2>
            <div className="template-buttons">
              <button className="template-btn" onClick={selectTemplate}>
                Базовый шаблон
              </button>
              <button className="template-btn" onClick={selectEmpty}>
                Пустая рутина
              </button>
            </div>
            <button className="modal-close" onClick={() => setShowTemplateModal(false)}>Отмена</button>
          </div>
        </div>
      )}
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
  // Функция перевода с отсечением компонента
  const translateProduct = (fullName) => {
    const baseName = fullName.split(' (')[0]
    return productNameRu[baseName] || baseName
  }
  const stepColors = ['#FCE68F', '#F3BCBE', '#CDBCDB', '#D6DC82', '#FFAB86', '#C2CEDF', '#7881BB']

  return (
    <div className="routine-section">
      <div className="routine-header">
        <h2>{title}</h2>
      </div>
      <div className="routine-steps-list">
        {steps.map((step, idx) => (
          <div key={step.routine_step_id} className="step-item">
            <div className="step-number">Шаг {step.step_order}</div>
            <div className="step-row">
              <div className="step-product-card" style={{ backgroundColor: stepColors[idx % stepColors.length] }}>
                <div className="step-product-name">{translateProduct(step.product.product_name)}</div>
              </div>
              <div className="step-frequency-info">
                <div className="frequency-label">Частота:</div>
                <div className="frequency-value">{getFrequencyText(step)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="routine-actions">
        <button className="delete-btn" onClick={() => onDelete(routine.routine_id)}>Удалить</button>
        <button className="edit-btn" onClick={() => onEdit(routine)}>Изменить</button>
      </div>
    </div>
  )
}