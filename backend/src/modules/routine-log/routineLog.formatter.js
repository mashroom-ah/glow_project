function formatRoutineLog(log) {
  return {
    routine_log_id: log.routine_log_id,

    routine_id: log.routine_id,

    user_id: log.user_id,

    completed_at: log.completed_at,

    overall_score:
      log.OverallScore?.score || null,

    steps:
      log.RoutineStepLogs?.map(
        (stepLog) => ({
          routine_step_log_id:
            stepLog.routine_step_log_id,

          routine_step_id:
            stepLog.routine_step_id,

          completed:
            stepLog.completed,

          step_order:
            stepLog.RoutineStep
              ?.step_order,

          frequency_type:
            stepLog.RoutineStep
              ?.frequency_type,

          frequency_value:
            stepLog.RoutineStep
              ?.frequency_value,

          product: stepLog.RoutineStep
            ?.Product
            ? {
                product_id:
                  stepLog.RoutineStep
                    .Product
                    .product_id,

                product_name:
                  stepLog.RoutineStep
                    .Product
                    .product_name,
              }
            : null,
        })
      ) || [],

    reactions:
      log.SkinReactions?.map(
        (reaction) => ({
          skin_reaction_id:
            reaction.skin_reaction_id,

          reaction_id:
            reaction.reaction_id,

          reaction_name:
            reaction.Reaction
              ?.reaction_name,

          reaction_group:
            reaction.Reaction
              ?.ReactionGroup
              ?.reaction_group_name,

          score: reaction.score,
        })
      ) || [],

    reaction_groups:
      log.ReactionGroupScores?.map(
        (group) => ({
          reaction_group_id:
            group.reaction_group_id,

          reaction_group_name:
            group.ReactionGroup
              ?.reaction_group_name,

          score: Number(group.score),
        })
      ) || [],
  };
}

module.exports = {
  formatRoutineLog,
};