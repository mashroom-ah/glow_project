const { ProductGroup, GroupComponent, ActiveComponent } = require('../../database/models');

class GroupComponentService {
  async getByGroup(groupName) {
    const group = await ProductGroup.findOne({
      where: { group_name: groupName },
    });
    if (!group) {
      throw new Error('Group not found');
    }
    const components = await GroupComponent.findAll({
      where: { group_id: group.group_id },
      include: [
        {
          model: ActiveComponent,
          attributes: ['component_id', 'component_name'],
        },
      ],
      order: [[ActiveComponent, 'component_name', 'ASC']],
    });
    return components.map((gc) => gc.ActiveComponent);
  }
}

module.exports = new GroupComponentService();