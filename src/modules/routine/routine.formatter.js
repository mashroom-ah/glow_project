function formatRoutine(routine) {
  return {
    routine_id: routine.routine_id,

    user_id: routine.user_id,

    routine_type: routine.routine_type,

    is_active: routine.is_active,

    archived_at: routine.archived_at,

    created_at: routine.created_at,

    updated_at: routine.updated_at,

    completed:
      routine.completed ?? undefined,

    routine_log_id:
      routine.routine_log_id ?? null,

    steps: routine.RoutineSteps.map(
      (step) => ({
        routine_step_id:
          step.routine_step_id,

        product_id: step.product_id,

        step_order: step.step_order,

        frequency_type:
          step.frequency_type,

        frequency_value:
          step.frequency_value,

        product: {
          product_id:
            step.Product.product_id,

          product_name:
            step.Product.product_name,

          group_name:
            step.Product.ProductGroup
              ?.group_name || null,

          component_name:
            step.Product
              .ActiveComponent
              ?.component_name ||
            null,
        },
      })
    ),
  };
}

module.exports = {
  formatRoutine,
};