const {
    ActiveComponent,
} = require('../../database/models');

class ComponentService {
    async getAll() {
        return ActiveComponent.findAll({
            order: [['component_name', 'ASC']],
        });
    }
}

module.exports = new ComponentService();