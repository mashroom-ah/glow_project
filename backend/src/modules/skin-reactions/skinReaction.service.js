const {
  Reaction,
  ReactionGroup,
} = require('../../database/models');

class SkinReactionService {
  async getAll() {
    const reactions =
      await Reaction.findAll({
        include: [
          {
            model: ReactionGroup,
          },
        ],

        order: [
          [
            ReactionGroup,
            'reaction_group_name',
            'ASC',
          ],
          ['reaction_name', 'ASC'],
        ],
      });

    return {
      reactions:
        reactions.map(
          (reaction) => ({
            reaction_id:
              reaction.reaction_id,

            reaction_name:
              reaction.reaction_name,

            reaction_group:
              reaction.ReactionGroup
                .reaction_group_name,
          })
        ),
    };
  }
}

module.exports =
  new SkinReactionService();