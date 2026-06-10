import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getRoutineLogsByDate,
  getRoutines,
  getRoutinesByDate,
  getSkinReactions,
  getStreak,
} from '../api/routineApi'

import {
  formatDateApi,
  formatDateCard,
} from '../utils/date'

import {
  getSPF,
} from '../api/spfApi'

import RoutineModal from '../components/RoutineModal'

import '../styles/main.css'

// ========== ПЕРЕВОД НАЗВАНИЙ ПРОДУКТОВ ==========
const productNameRu = {
  // Очищение
  'Foam Cleanser': 'Пенка для умывания',
  'Gel Cleanser': 'Гель для умывания',
  'Cream Gel Cleanser': 'Крем-гель для умывания',
  'Hydrophilic Oil': 'Гидрофильное масло',
  'Micellar Water': 'Мицелярная вода',
  'Basic Cleanser': 'Базовый очищающий гель',
  // Увлажнение
  'Cream': 'Крем',
  'Serum': 'Сыворотка',
  'Essence': 'Эссенция',
  'Toner': 'Тонер',
  'Mask': 'Маска',
  'Moisturizing Cream': 'Увлажняющий крем',
  'Hydrating Toner': 'Увлажняющий тонер',
  'Barrier Serum': 'Восстанавливающая сыворотка',
  'Basic SPF Cream': 'Базовый SPF-крем',
  // Отшелушивание
  'Peeling Solution': 'Пилинг-раствор',
  'Pads': 'Пэды',
  'Scrub': 'Скраб',
  'Enzyme Powder': 'Энзимная пудра',
  'Acid Toner': 'Кислотный тонер',
  'BHA Pads': 'BHA-пэды',
  // Борьба с акне
  'Spot Treatment': 'Точечное средство',
  'Retinol Serum': 'Сыворотка',
  'Azelaic Acid Serum': 'Сыворотка',
  // Антивозрастной
  'Night Cream': 'Ночной крем',
  'Anti Age Serum': 'Антивозрастная сыворотка',
  'Eye Cream': 'Крем для глаз',
  'Masks': 'Маски',
  // Успокаивающий
  'Calming Mask': 'Успокаивающая маска',
  'Recovery Cream': 'Восстанавливающий крем'
}

const routineTitles = {
  morning: 'Утро',
  evening: 'Вечер',
  universal: 'Универсальная',
}

const routineOrder = {
  morning: 1,
  evening: 2,
  universal: 3,
}

export default function MainPage() {
  const navigate = useNavigate()

  const [streak, setStreak] = useState(0)
  const [spf, setSpf] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [logs, setLogs] = useState([])
  const [allRoutines, setAllRoutines] = useState([])
  const [reactions, setReactions] = useState([])
  const [openedRoutine, setOpenedRoutine] = useState(null)
  const [loading, setLoading] = useState(true)

  const dateInputRef = useRef(null)

  const routinesMap = useMemo(() => {
    const map = {}
    allRoutines.forEach((routine) => {
      map[routine.routine_id] = routine
    })
    return map
  }, [allRoutines])

  const loadPage = async () => {
    try {
      setLoading(true)
      const formatted = formatDateApi(selectedDate)
      const token = localStorage.getItem('access_token')
      if (!token) return

      const [streakData, routinesData, reactionsData, spfData] = await Promise.all([
        getStreak(),
        getRoutines(),
        getSkinReactions(),
        getSPF(),
      ])

      setStreak(streakData?.streak || 0)
      setSpf(spfData?.recommended_spf ?? 0)
      setAllRoutines(routinesData || [])

      const reactionsArray = reactionsData?.reactions || []
      setReactions(reactionsArray)
      localStorage.setItem('skin_reactions', JSON.stringify(reactionsArray))

      let logsData = await getRoutineLogsByDate(formatted)
      if (!logsData?.length) {
        logsData = await getRoutinesByDate(formatted)
      }

      const sortedLogs = [...(logsData || [])].sort((a, b) => {
        const routineA = routinesData.find((routine) => routine.routine_id === a.routine_id)
        const routineB = routinesData.find((routine) => routine.routine_id === b.routine_id)
        const typeA = routineA?.routine_type || 'universal'
        const typeB = routineB?.routine_type || 'universal'
        return routineOrder[typeA] - routineOrder[typeB]
      })
      setLogs(sortedLogs)
    } catch (error) {
      console.log(error)
      const cachedReactions = localStorage.getItem('skin_reactions')
      if (cachedReactions) {
        setReactions(JSON.parse(cachedReactions))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage()
  }, [selectedDate])

  const dates = useMemo(() => {
    return [
      new Date(selectedDate.getTime() - 86400000),
      selectedDate,
      new Date(selectedDate.getTime() + 86400000),
    ]
  }, [selectedDate])

  const openCalendar = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker()
      return
    }
    dateInputRef.current?.click()
  }

  return (
    <div className="main-page">
      <div className="main-container">
        <div className="streak-banner">
          <div className="streak-icon">
            <img src="/icons/streak.png" alt="streak" />
          </div>
          <p>Ваша серия длится {streak} дней!</p>
        </div>

        <div className="dates-row">
          <button className="date-arrow" onClick={openCalendar}>
            <img src="/icons/arrow-left.svg" alt="prev" />
          </button>

          {dates.map((date, index) => {
            const formatted = formatDateCard(date)
            return (
              <button
                key={index}
                className={`date-card ${index === 1 ? 'active' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="date-day">{formatted.day}</span>
                <span className="date-month">{formatted.month}</span>
              </button>
            )
          })}

          <button className="date-arrow" onClick={openCalendar}>
            <img src="/icons/arrow-right.svg" alt="next" />
          </button>

          <input
            ref={dateInputRef}
            type="date"
            className="hidden-date-input"
            value={formatDateApi(selectedDate)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>

        <div className="spf-banner">
          <div className="spf-icon">
            <img src="/icons/warning.svg" alt="spf" />
          </div>
          <p>{spf === 0 ? 'Сегодня SPF не требуется' : `Нанесите SPF-${spf}`}</p>
        </div>

        <div className="routine-list">
          {!loading &&
            logs.map((routine) => {
              const routineInfo = routinesMap[routine.routine_id]
              const type = routineInfo?.routine_type || 'universal'
              return (
                <div key={routine.routine_id} className="routine-card">
                  <div className={`routine-label ${type}`}>
                    {routineTitles[type]}
                  </div>
                  <div className="routine-steps">
                    {routine.steps.map((step) => (
                      <div key={step.routine_step_id} className="routine-step">
                        <span className="step-status">
                          <img
                            src={step.completed ? '/icons/check.svg' : '/icons/cross.svg'}
                            alt="status"
                          />
                        </span>
                        <span className="step-name">
                          {productNameRu[step.product.product_name] || step.product.product_name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="routine-button"
                    onClick={() => setOpenedRoutine({ ...routine, routine_type: type })}
                  >
                    Отметить
                  </button>
                </div>
              )
            })}
        </div>

        <nav className="bottom-nav">
          <button className="nav-item" onClick={() => navigate('/constructor')}>
            <img src="/icons/constructor.svg" alt="" />
          </button>
          <button className="nav-item" onClick={() => navigate('/water')}>
            <img src="/icons/water.svg" alt="" />
          </button>
          <button className="nav-item active-nav" onClick={() => navigate('/main')}>
            <img src="/icons/home.svg" alt="" />
          </button>
          <button className="nav-item" onClick={() => navigate('/analytics')}>
            <img src="/icons/chart.svg" alt="" />
          </button>
          <button className="nav-item" onClick={() => navigate('/profile')}>
            <img src="/icons/profile.svg" alt="" />
          </button>
        </nav>
      </div>

      {openedRoutine && (
        <RoutineModal
          routine={openedRoutine}
          reactions={reactions}
          date={selectedDate}
          onClose={() => setOpenedRoutine(null)}
          onSuccess={() => {
            setOpenedRoutine(null)
            loadPage()
          }}
        />
      )}
    </div>
  )
}