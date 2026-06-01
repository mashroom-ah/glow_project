const componentService = require('../../../src/modules/component/component.service');
const { ActiveComponent } = require('../../../src/database/models');

jest.mock('../../../src/database/models', () => ({
  ActiveComponent: {
    findAll: jest.fn(),
  },
}));

describe('ComponentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('возвращает все активные компоненты', async () => {
      const mockComponents = [
        { component_id: 'c1', component_name: 'retinol' },
        { component_id: 'c2', component_name: 'hyaluronic_acid' },
      ];
      ActiveComponent.findAll.mockResolvedValue(mockComponents);

      const result = await componentService.getAll();

      expect(ActiveComponent.findAll).toHaveBeenCalledWith({
        order: [['component_name', 'ASC']],
      });
      expect(result).toEqual(mockComponents);
    });
  });
});