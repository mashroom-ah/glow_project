import { useMemo, useState } from 'react'

import {
  createRoutineLog,
  updateRoutineLog,
} from '../api/routineApi'

import {
  formatDateApi,
} from '../utils/date'

const reactionGroupRu = {
  hydration: 'Увлажнение',
  irritation: 'Раздражение',
  acne: 'Акне',
  sensitivity: 'Чувствительность',
  texture: 'Текстура',
}

const reactionRu = {
  dryness: 'Сухость',
  dehydration: 'Обезвоженность',
  tightness: 'Стянутость',

  redness: 'Покраснение',
  burning: 'Жжение',
  itching: 'Зуд',

  breakouts: 'Высыпания',
  clogged_pores: 'Забитые поры',
  inflammation: 'Воспаление',

  stinging: 'Пощипывание',
  reactivity: 'Реактивность',
  peeling: 'Шелушение',

  rough_texture: 'Неровная текстура',
  oiliness: 'Жирность',
  uneven_texture: 'Неравномерная текстура',
}

export default function RoutineModal({
  routine,
  reactions,
  date,
  onClose,
  onSuccess,
}) {
  const [steps, setSteps] = useState(
    routine.steps.map((step) => ({
      ...step,
      completed:
        step.completed || false,
    }))
  )

  const [overallScore, setOverallScore] =
    useState(
      routine.overall_score || 5
    )

  const [selectedReactions, setSelectedReactions] =
    useState(() => {
      const initial = {}

      if (
        routine.reactions &&
        Array.isArray(
          routine.reactions
        )
      ) {
        routine.reactions.forEach(
          (reaction) => {
            initial[
              reaction.reaction_id
            ] = {
              selected: true,
              score:
                reaction.score || 5,
            }
          }
        )
      }

      return initial
    })

  const groupedReactions = useMemo(() => {
    return reactions.reduce(
      (acc, reaction) => {
        const group =
          reaction.reaction_group

        if (!acc[group]) {
          acc[group] = []
        }

        acc[group].push(reaction)

        return acc
      },
      {}
    )
  }, [reactions])

  const toggleStep = (id) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.routine_step_id === id
          ? {
              ...step,
              completed:
                !step.completed,
            }
          : step
      )
    )
  }

  const selectReaction = (
    reactionId
  ) => {
    setSelectedReactions((prev) => {
      const existing =
        prev[reactionId]

      if (existing?.selected) {
        const updated = {
          ...prev,
        }

        delete updated[reactionId]

        return updated
      }

      return {
        ...prev,
        [reactionId]: {
          selected: true,
          score: 5,
        },
      }
    })
  }

  const changeReactionScore = (
    reactionId,
    score
  ) => {
    setSelectedReactions((prev) => ({
      ...prev,

      [reactionId]: {
        ...prev[reactionId],
        selected: true,
        score: Number(score),
      },
    }))
  }

  const handleSave = async () => {
    if (!overallScore) {
      alert(
        'Укажите общую оценку кожи'
      )

      return
    }

    const preparedReactions =
      Object.entries(
        selectedReactions
      ).map(
        ([reactionId, value]) => ({
          reaction_id: reactionId,

          score:
            Number(value.score) || 1,
        })
      )

    const body = {
      steps: steps.map((step) => ({
        routine_step_id:
          step.routine_step_id,

        completed:
          step.completed,
      })),

      reactions:
        preparedReactions,

      overall_score:
        Number(overallScore),
    }

    try {
      if (
        routine.routine_log_id
      ) {
        await updateRoutineLog(
          routine.routine_log_id,
          body
        )
      } else {
        await createRoutineLog({
          routine_id:
            routine.routine_id,

          completed_at:
            formatDateApi(date),

          ...body,
        })
      }

      onSuccess()
    } catch (error) {
      console.log(error)

      alert(
        'Ошибка сохранения отчёта'
      )
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>
          Отметить рутину
        </h2>

        <div className="modal-section">
          <h3>
            Выполненные шаги
          </h3>

          <div className="modal-steps">
            {steps.map((step) => (
              <label
                key={
                  step.routine_step_id
                }
                className="modal-step"
              >
                <input
                  type="checkbox"
                  checked={
                    step.completed
                  }
                  onChange={() =>
                    toggleStep(
                      step.routine_step_id
                    )
                  }
                />

                <span>
                  {
                    step.product
                      .product_name
                  }
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <h3>
            Общее состояние кожи
          </h3>

          <div className="score-block">
            <input
              type="range"
              min="1"
              max="10"
              value={
                overallScore
              }
              onChange={(e) =>
                setOverallScore(
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <span>
              {overallScore}/10
            </span>
          </div>
        </div>

        <div className="modal-section">
          <h3>
            Реакции кожи
          </h3>

          <div className="reaction-groups">
            {Object.entries(
              groupedReactions
            ).map(
              ([group, items]) => (
                <details
                  key={group}
                  className="reaction-group"
                >
                  <summary>
                    {reactionGroupRu[
                      group
                    ] || group}
                  </summary>

                  <div className="reaction-items">
                    {items.map(
                      (item) => {
                        const selected =
                          selectedReactions[
                            item.reaction_id
                          ]

                        return (
                          <div
                            key={
                              item.reaction_id
                            }
                            className="reaction-item"
                          >
                            <label className="reaction-label">
                              <input
                                type="checkbox"
                                checked={
                                  !!selected
                                }
                                onChange={() =>
                                  selectReaction(
                                    item.reaction_id
                                  )
                                }
                              />

                              <span>
                                {reactionRu[
                                  item.reaction_name
                                ] ||
                                  item.reaction_name}
                              </span>
                            </label>

                            {selected && (
                              <div className="reaction-score">
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={
                                    selected.score
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    changeReactionScore(
                                      item.reaction_id,
                                      e.target
                                        .value
                                    )
                                  }
                                />

                                <span>
                                  {
                                    selected.score
                                  }
                                  /10
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      }
                    )}
                  </div>
                </details>
              )
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={onClose}
          >
            Закрыть
          </button>

          <button
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}