const {
  Routine,
  RoutineStep,
  Product,
  ProductGroup,
  ActiveComponent,
  GroupComponent,
  RoutineLog,
} = require('../../database/models');

const {
  formatRoutine,
} = require('./routine.formatter');

const {
  validateRoutine,
} = require('./routineValidation');

const { Op } = require('sequelize');

class RoutineService {
  async create(userId, data) {
    const routine = await Routine.create({
      user_id: userId,
      routine_type: data.routine_type,
    });

    if (data.steps?.length) {
      for (const step of data.steps) {
        const product =
          await Product.findByPk(
            step.product_id
          );

        if (!product) {
          throw new Error(
            'Product not found'
          );
        }

        if (product.component_id) {
          const allowed =
            await GroupComponent.findOne({
              where: {
                group_id:
                  product.group_id,

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
          routine_id:
            routine.routine_id,

          product_id:
            step.product_id,

          step_order:
            step.step_order,

          frequency_type:
            step.frequency_type ||
            'daily',

          frequency_value:
            step.frequency_value ||
            0,
        });
      }
    }

    return this.getById(
      userId,
      routine.routine_id
    );
  }

  async getAll(userId) {
    const routines =
      await Routine.findAll({
        where: {
          user_id: userId,
          is_active: true,
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
        (a, b) =>
          a.step_order -
          b.step_order
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

    return routines.map(
      formatRoutine
    );
  }

  async getById(userId, routineId) {
    const routine =
      await Routine.findOne({
        where: {
          routine_id: routineId,
          user_id: userId,
          is_active: true,
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
      throw new Error(
        'Routine not found'
      );
    }

    routine.RoutineSteps.sort(
      (a, b) =>
        a.step_order -
        b.step_order
    );

    return formatRoutine(routine);
  }

  async getByDate(userId, date) {
    const routines =
      await Routine.findAll({
        where: {
          user_id: userId,
          is_active: true,
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

    const targetDate =
      new Date(date);

    targetDate.setHours(
      0,
      0,
      0,
      0
    );

    const dayOfWeek =
      targetDate.getDay();

    const startOfDay =
      new Date(targetDate);

    const endOfDay =
      new Date(targetDate);

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    const result = [];

    for (const routine of routines) {
      const plainRoutine =
        routine.toJSON();

      plainRoutine.RoutineSteps =
        plainRoutine.RoutineSteps.filter(
          (step) => {
            // DAILY

            if (
              step.frequency_type ===
              'daily'
            ) {
              return true;
            }

            // WEEKLY

            if (
              step.frequency_type ===
              'weekly'
            ) {
              return (
                dayOfWeek ===
                step.frequency_value
              );
            }

            // EVERY N DAYS

            if (
              step.frequency_type ===
              'every_n_days'
            ) {
              if (
                step.frequency_value <=
                0
              ) {
                return false;
              }

              const createdAt =
                new Date(
                  step.created_at
                );

              createdAt.setHours(
                0,
                0,
                0,
                0
              );

              const diffMs =
                targetDate -
                createdAt;

              const diffDays =
                Math.floor(
                  diffMs /
                    (1000 *
                      60 *
                      60 *
                      24)
                );

              return (
                diffDays >= 0 &&
                diffDays %
                  step.frequency_value ===
                  0
              );
            }

            return false;
          }
        );

      plainRoutine.RoutineSteps.sort(
        (a, b) =>
          a.step_order -
          b.step_order
      );

      const existingLog =
        await RoutineLog.findOne({
          where: {
            routine_id:
              plainRoutine.routine_id,

            completed_at: {
              [Op.between]: [
                startOfDay,
                endOfDay,
              ],
            },
          },
        });

      plainRoutine.completed =
        !!existingLog;

      plainRoutine.routine_log_id =
        existingLog?.routine_log_id ||
        null;

      if (
        plainRoutine.RoutineSteps
          .length > 0
      ) {
        result.push(
          formatRoutine(
            plainRoutine
          )
        );
      }
    }

    return result;
  }

  async update(
    userId,
    routineId,
    data
  ) {
    const oldRoutine =
      await Routine.findOne({
        where: {
          routine_id: routineId,
          user_id: userId,
          is_active: true,
        },
      });

    if (!oldRoutine) {
      throw new Error(
        'Routine not found'
      );
    }

    await oldRoutine.update({
      is_active: false,
      archived_at: new Date(),
    });

    const newRoutine =
      await Routine.create({
        user_id: userId,
        routine_type:
          data.routine_type,
      });

    if (data.steps?.length) {
      for (const step of data.steps) {
        const product =
          await Product.findByPk(
            step.product_id
          );

        if (!product) {
          throw new Error(
            'Product not found'
          );
        }

        await RoutineStep.create({
          routine_id:
            newRoutine.routine_id,

          product_id:
            step.product_id,

          step_order:
            step.step_order,

          frequency_type:
            step.frequency_type ||
            'daily',

          frequency_value:
            step.frequency_value ||
            0,
        });
      }
    }

    return this.getById(
      userId,
      newRoutine.routine_id
    );
  }

  async delete(userId, routineId) {
    const routine =
      await Routine.findOne({
        where: {
          routine_id: routineId,
          user_id: userId,
          is_active: true,
        },
      });

    if (!routine) {
      throw new Error(
        'Routine not found'
      );
    }

    await routine.update({
      is_active: false,
      archived_at: new Date(),
    });

    return {
      message:
        'Routine archived successfully',
    };
  }

  async validate(data) {
    const productIds =
      data.steps.map(
        (step) => step.product_id
      );

    const products =
      await Product.findAll({
        where: {
          product_id:
            productIds,
        },

        include: [
          {
            model: ProductGroup,

            attributes: [
              'group_name',
            ],
          },

          {
            model:
              ActiveComponent,

            attributes: [
              'component_name',
            ],
          },
        ],
      });

    const normalizedProducts =
      products.map(
        (product) => ({
          product_name:
            product.product_name,

          group_name:
            product.ProductGroup
              .group_name,

          component_name:
            product
              .ActiveComponent
              ?.component_name ||
            null,
        })
      );

    return validateRoutine(
      normalizedProducts
    );
  }
}

module.exports =
  new RoutineService();