const {
  Routine,
  RoutineStep,
  Product,
  ProductGroup,
  ActiveComponent,
  GroupComponent,
} = require('../../database/models');

class RoutineService {
  async create(userId, data) {
    const routine = await Routine.create({
      user_id: userId,
      routine_type: data.routine_type,
    });

    if (data.steps?.length) {
      for (const step of data.steps) {
        const product = await Product.findByPk(
          step.product_id
        );

        if (!product) {
          throw new Error('Product not found');
        }

        if (product.component_id) {
          const allowed =
            await GroupComponent.findOne({
              where: {
                group_id: product.group_id,
                component_id:
                  product.component_id,
              },
            });

          if (!allowed) {
            throw new Error(
              'Invalid product component'
            );
          }
        }

        await RoutineStep.create({
          routine_id: routine.routine_id,
          product_id: step.product_id,
          step_order: step.step_order,
          frequency_type:
            step.frequency_type || 'daily',
          frequency_value:
            step.frequency_value || 0,
        });
      }
    }

    return this.getById(
      userId,
      routine.routine_id
    );
  }

  async getAll(userId) {
    const routines = await Routine.findAll({
      where: {
        user_id: userId,
      },

      include: [
        {
          model: RoutineStep,

          include: [
            {
              model: Product,

              include: [
                ProductGroup,
                ActiveComponent,
              ],
            },
          ],
        },
      ],
    });

    routines.forEach((routine) => {
      routine.RoutineSteps.sort(
        (a, b) => a.step_order - b.step_order
      );
    });

    const order = {
      morning: 1,
      evening: 2,
      universal: 3,
    };

    routines.sort((a, b) => {
      return (
        order[a.routine_type] -
        order[b.routine_type]
      );
    });

    return routines;
  }

  async getById(userId, routineId) {
    const routine = await Routine.findOne({
      where: {
        routine_id: routineId,
        user_id: userId,
      },

      include: [
        {
          model: RoutineStep,

          include: [
            {
              model: Product,

              include: [
                ProductGroup,
                ActiveComponent,
              ],
            },
          ],
        },
      ],
    });

    if (!routine) {
      throw new Error('Routine not found');
    }

    routine.RoutineSteps.sort(
      (a, b) => a.step_order - b.step_order
    );

    return routine;
  }

  async update(userId, routineId, data) {
    const routine = await Routine.findOne({
      where: {
        routine_id: routineId,
        user_id: userId,
      },
    });

    if (!routine) {
      throw new Error('Routine not found');
    }

    await routine.update({
      routine_type: data.routine_type,
    });

    // удалить старые шаги
    await RoutineStep.destroy({
      where: {
        routine_id: routine.routine_id,
      },
    });

    // создать новые
    if (data.steps?.length) {
      for (const step of data.steps) {
        await RoutineStep.create({
          routine_id: routine.routine_id,
          product_id: step.product_id,
          step_order: step.step_order,

          frequency_type:
            step.frequency_type || 'daily',

          frequency_value:
            step.frequency_value || 0,
        });
      }
    }

    return this.getById(
      userId,
      routine.routine_id
    );
  }

  async delete(userId, routineId) {
    const routine = await Routine.findOne({
      where: {
        routine_id: routineId,
        user_id: userId,
      },
    });

    if (!routine) {
      throw new Error('Routine not found');
    }

    await routine.destroy();

    return {
      message:
        'Routine deleted successfully',
    };
  }
}

module.exports = new RoutineService();