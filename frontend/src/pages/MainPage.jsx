import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

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
  const [streak, setStreak] =
    useState(0)

  const [selectedDate, setSelectedDate] =
    useState(new Date())

  const [logs, setLogs] = useState([])

  const [allRoutines, setAllRoutines] =
    useState([])

  const [reactions, setReactions] =
    useState([])

  const [openedRoutine, setOpenedRoutine] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const dateInputRef = useRef(null)

  const loadPage = async () => {
    try {
      setLoading(true)

      const formatted =
        formatDateApi(selectedDate)

      const token =
        localStorage.getItem(
          'access_token'
        )

      if (!token) {
        console.log(
          'No access token'
        )

        return
      }

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

      localStorage.setItem(
        'skin_reactions',
        JSON.stringify(
          reactionsArray
        )
      )

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
              routine_log_id: null,

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

      const cachedReactions =
        localStorage.getItem(
          'skin_reactions'
        )

      if (cachedReactions) {
        setReactions(
          JSON.parse(
            cachedReactions
          )
        )
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

        <div className="dates-row">
          <button
            className="date-arrow"
            onClick={openCalendar}
          >
            <img
              src="/icons/arrow-left.svg"
              alt="prev"
            />
          </button>

          {dates.map(
            (date, index) => {
              const formatted =
                formatDateCard(
                  date
                )

              return (
                <button
                  key={index}
                  className={`date-card ${
                    index === 1
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedDate(
                      date
                    )
                  }
                >
                  <span className="date-day">
                    {
                      formatted.day
                    }
                  </span>

                  <span className="date-month">
                    {
                      formatted.month
                    }
                  </span>
                </button>
              )
            }
          )}

          <button
            className="date-arrow"
            onClick={openCalendar}
          >
            <img
              src="/icons/arrow-right.svg"
              alt="next"
            />
          </button>

          <input
            ref={dateInputRef}
            type="date"
            className="hidden-date-input"
            value={formatDateApi(
              selectedDate
            )}
            onChange={(e) =>
              setSelectedDate(
                new Date(
                  e.target.value
                )
              )
            }
          />
        </div>

        <div className="routine-list">
          {loading ? (
            <div className="routine-card">
              Загрузка...
            </div>
          ) : logs.length ? (
            logs.map((routine) => {
              const type =
                routine.routine_type ||
                'universal'

              return (
                <div
                  key={
                    routine.routine_id
                  }
                  className="routine-card"
                >
                  <div
                    className={`routine-label ${type}`}
                  >
                    {
                      routineTitles[
                        type
                      ]
                    }
                  </div>

                  <div className="routine-steps">
                    {routine.steps.map(
                      (step) => (
                        <div
                          key={
                            step.routine_step_id
                          }
                          className="routine-step"
                        >
                          <span className="step-status">
                            {step.completed ? (
                              <img
                                src="/icons/check.svg"
                                alt="done"
                              />
                            ) : (
                              <img
                                src="/icons/cross.svg"
                                alt="not-done"
                              />
                            )}
                          </span>

                          <span className="step-name">
                            {
                              step
                                .product
                                ?.product_name
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    className="routine-button"
                    onClick={() =>
                      setOpenedRoutine(
                        routine
                      )
                    }
                  >
                    Отметить
                  </button>
                </div>
              )
            })
          ) : (
            <div className="routine-card">
              На эту дату рутин
              нет
            </div>
          )}
        </div>

        <nav className="bottom-nav">
          <button className="nav-item">
            <img
              src="/icons/constructor.svg"
              alt="constructor"
            />
          </button>

          <button className="nav-item">
            <img
              src="/icons/water.svg"
              alt="water"
            />
          </button>

          <button className="nav-item active-nav">
            <img
              src="/icons/home.svg"
              alt="home"
            />
          </button>

          <button className="nav-item">
            <img
              src="/icons/chart.svg"
              alt="reports"
            />
          </button>

          <button className="nav-item">
            <img
              src="/icons/profile.svg"
              alt="profile"
            />
          </button>
        </nav>
      </div>

      {openedRoutine && (
        <RoutineModal
          routine={openedRoutine}
          reactions={reactions}
          date={selectedDate}
          onClose={() =>
            setOpenedRoutine(
              null
            )
          }
          onSuccess={() => {
            setOpenedRoutine(
              null
            )

            loadPage()
          }}
        />
      )}
    </div>
  )
}