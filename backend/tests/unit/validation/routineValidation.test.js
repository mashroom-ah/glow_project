const { validateRoutine } = require('../../../src/modules/routine/routineValidation');

describe('validateRoutine', () => {
  const mockProducts = (groups) => groups.map((group, i) => ({
    product_name: `Product ${i}`,
    group_name: group,
    component_name: null,
  }));

  test('валидная рутина с правильным порядком', () => {
    const products = mockProducts(['cleansing', 'peeling', 'hydration', 'calming']);
    const result = validateRoutine(products);
    expect(result.valid).toBe(true);
    expect(result.critical_conflicts).toHaveLength(0);
  });

  test('предупреждение при неправильном порядке', () => {
    const products = mockProducts(['hydration', 'cleansing']);
    const result = validateRoutine(products);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].type).toBe('order');
  });

  test('критический конфликт: retinol + aha', () => {
    const products = [
      { product_name: 'Retinol', group_name: 'anti_acne', component_name: 'retinol' },
      { product_name: 'AHA', group_name: 'peeling', component_name: 'aha' },
    ];
    const result = validateRoutine(products);
    expect(result.critical_conflicts.length).toBeGreaterThan(0);
    expect(result.critical_conflicts[0].components).toContain('retinol');
    expect(result.critical_conflicts[0].components).toContain('aha');
  });

  test('совет при использовании ретинола', () => {
    const products = [
      { product_name: 'Retinol', group_name: 'anti_acne', component_name: 'retinol' },
    ];
    const result = validateRoutine(products);
    expect(result.tips.some(tip => tip.message.includes('SPF'))).toBe(true);
  });
});