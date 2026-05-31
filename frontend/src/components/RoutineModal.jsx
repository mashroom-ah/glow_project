import { useMemo, useState } from 'react'

import {
  createRoutineLog,
  updateRoutineLog,
} from '../api/routineApi'

import {
  formatDateApi,
} from '../utils/date'

export default function RoutineModal({
  routine,
  reactions,
  date,
  onClose,
  onSuccess,
}) {
  const [steps, setSteps] = useState(
    routine.steps
  )

  const groupedReactions = useMemo(() => {
    return reactions.reduce(
      (acc, reaction) => {
        if (
          !acc[
            reaction.reaction_group
          ]
        ) {
          acc[
            reaction.reaction_group
          ] = []
        }

        acc[
          reaction.reaction_group
        ].push(reaction)

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

  const handleSave = async () => {
    const body = {
      steps: steps.map((step) => ({
        routine_step_id:
          step.routine_step_id,

        completed:
          step.completed,
      })),

      reactions: [],

      overall_score: 5,
    }

    if (routine.routine_log_id) {
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
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>
          Отметить рутину
        </h2>

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

        <div className="modal-reactions">
          {Object.entries(
            groupedReactions
          ).map(([group, items]) => (
            <div key={group}>
              <h3>{group}</h3>

              {items.map((item) => (
                <div
                  key={
                    item.reaction_id
                  }
                >
                  {
                    item.reaction_name
                  }
                </div>
              ))}
            </div>
          ))}
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