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

import RoutineModal from '../components/RoutineModal'

import '../styles/main.css'

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
  const navigate =
    useNavigate()

  const [streak, setStreak] =
    useState(0)

  const [selectedDate, setSelectedDate] =
    useState(new Date())

  const [logs, setLogs] =
    useState([])

  const [allRoutines, setAllRoutines] =
    useState([])

  const [reactions, setReactions] =
    useState([])

  const [openedRoutine, setOpenedRoutine] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const dateInputRef =
    useRef(null)

  const loadPage = async () => {
    try {
      setLoading(true)

      const formatted =
        formatDateApi(
          selectedDate
        )

      const [
        streakData,
        routinesData,
        reactionsData,
        logsData,
        routinesByDate,
      ] = await Promise.all([
        getStreak(),
        getRoutines(),
        getSkinReactions(),
        getRoutineLogsByDate(
          formatted
        ),
        getRoutinesByDate(
          formatted
        ),
      ])

      setStreak(
        streakData?.streak || 0
      )

      setAllRoutines(
        routinesData || []
      )

      const reactionsArray =
        reactionsData?.reactions ||
        []

      setReactions(reactionsArray)

      const preparedLogs =
        routinesByDate.map(
          (routine) => {
            const existingLog =
              logsData.find(
                (log) =>
                  log.routine_id ===
                  routine.routine_id
              )

            if (existingLog) {
              return {
                ...existingLog,
                routine_type:
                  routine.routine_type,
              }
            }

            return {
              ...routine,
              routine_log_id:
                null,

              steps:
                routine.steps.map(
                  (step) => ({
                    ...step,
                    completed: false,
                  })
                ),
            }
          }
        )

      const sortedLogs = [
        ...preparedLogs,
      ].sort((a, b) => {
        const typeA =
          a.routine_type ||
          'universal'

        const typeB =
          b.routine_type ||
          'universal'

        return (
          routineOrder[typeA] -
          routineOrder[typeB]
        )
      })

      setLogs(sortedLogs)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage()
  }, [selectedDate])

  const dates = useMemo(() => {
    return [
      new Date(
        selectedDate.getTime() -
          86400000
      ),

      selectedDate,

      new Date(
        selectedDate.getTime() +
          86400000
      ),
    ]
  }, [selectedDate])

  const openCalendar = () => {
    if (
      dateInputRef.current
        ?.showPicker
    ) {
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
            <img
              src="/icons/streak.png"
              alt="streak"
            />
          </div>

          <p>
            Ваша серия длится{' '}
            {streak} дней!
          </p>
        </div>

        <nav className="bottom-nav">
          <button
            className="nav-item"
            onClick={() =>
              navigate(
                '/constructor'
              )
            }
          >
            <img
              src="/icons/constructor.svg"
              alt="constructor"
            />
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate('/water')
            }
          >
            <img
              src="/icons/water.svg"
              alt="water"
            />
          </button>

          <button
            className="nav-item active-nav"
            onClick={() =>
              navigate('/main')
            }
          >
            <img
              src="/icons/home.svg"
              alt="home"
            />
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                '/analytics'
              )
            }
          >
            <img
              src="/icons/chart.svg"
              alt="reports"
            />
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                '/profile'
              )
            }
          >
            <img
              src="/icons/profile.svg"
              alt="profile"
            />
          </button>
        </nav>
      </div>
    </div>
  )
}