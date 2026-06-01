// НЕТ require('uuid') - используем статические строки

const mockUsers = {
  regular: {
    user_id: 'test-user-id-1',
    email: 'test@example.com',
    password_hash: '$2a$10$hashed_password',
    name: 'Test User',
    city: 'Moscow',
    height: 175,
    weight: 70,
    birth_date: '1990-01-01',
    activity_level: 'medium',
    water_avg: 2100,
    created_at: new Date(),
    updated_at: new Date(),
  },
  active: {
    user_id: 'test-user-id-2',
    email: 'active@example.com',
    name: 'Active User',
    city: 'London',
    height: 180,
    weight: 75,
    activity_level: 'high',
    water_avg: 2700,
  },
  low: {
    user_id: 'test-user-id-3',
    email: 'low@example.com',
    name: 'Low Activity User',
    city: 'Berlin',
    height: 165,
    weight: 60,
    activity_level: 'low',
    water_avg: 1800,
  },
};

const mockItems = {
  fresh: {
    item_id: 'test-item-1',
    name: 'Fresh Moisturizer',
    production_date: '2024-01-01',
    shelf_life_closed: 365,
    expiration_date: '2024-12-31',
    status: 'valid',
    is_active: true,
  },
  expiring: {
    item_id: 'test-item-2',
    name: 'Expiring Soon Serum',
    production_date: '2024-05-01',
    shelf_life_closed: 90,
    expiration_date: '2024-07-30',
    status: 'expiring_soon',
    is_active: true,
  },
  expired: {
    item_id: 'test-item-3',
    name: 'Expired Cream',
    production_date: '2023-01-01',
    shelf_life_closed: 365,
    expiration_date: '2024-01-01',
    status: 'expired',
    is_active: true,
  },
  archived: {
    item_id: 'test-item-4',
    name: 'Archived Product',
    production_date: '2024-01-01',
    shelf_life_closed: 365,
    expiration_date: '2024-12-31',
    status: 'valid',
    is_active: false,
  },
};

const mockProducts = {
  cleanser: {
    product_id: 'test-product-1',
    product_name: 'Gentle Foam Cleanser',
    group_id: 'cleansing-group-id',
    group_name: 'cleansing',
    component_id: null,
    component_name: null,
  },
  retinol: {
    product_id: 'test-product-2',
    product_name: 'Retinol Serum',
    group_id: 'anti_acne-group-id',
    group_name: 'anti_acne',
    component_id: 'test-component-1',
    component_name: 'retinol',
  },
  aha: {
    product_id: 'test-product-3',
    product_name: 'AHA Toner',
    group_id: 'peeling-group-id',
    group_name: 'peeling',
    component_id: 'test-component-2',
    component_name: 'aha',
  },
  hyaluronic: {
    product_id: 'test-product-4',
    product_name: 'Hyaluronic Acid',
    group_id: 'hydration-group-id',
    group_name: 'hydration',
    component_id: 'test-component-3',
    component_name: 'hyaluronic_acid',
  },
  spf: {
    product_id: 'test-product-5',
    product_name: 'SPF 50',
    group_id: 'hydration-group-id',
    group_name: 'hydration',
    component_id: null,
    component_name: null,
  },
};

const mockRoutines = {
  morning: {
    routine_id: 'test-routine-1',
    routine_type: 'morning',
    is_active: true,
    steps: [
      {
        routine_step_id: 'test-step-1',
        product_id: mockProducts.cleanser.product_id,
        step_order: 1,
        frequency_type: 'daily',
        frequency_value: 0,
      },
      {
        routine_step_id: 'test-step-2',
        product_id: mockProducts.hyaluronic.product_id,
        step_order: 2,
        frequency_type: 'daily',
        frequency_value: 0,
      },
      {
        routine_step_id: 'test-step-3',
        product_id: mockProducts.spf.product_id,
        step_order: 3,
        frequency_type: 'daily',
        frequency_value: 0,
      },
    ],
  },
  evening: {
    routine_id: 'test-routine-2',
    routine_type: 'evening',
    is_active: true,
    steps: [
      {
        routine_step_id: 'test-step-4',
        product_id: mockProducts.cleanser.product_id,
        step_order: 1,
        frequency_type: 'daily',
        frequency_value: 0,
      },
      {
        routine_step_id: 'test-step-5',
        product_id: mockProducts.retinol.product_id,
        step_order: 2,
        frequency_type: 'weekly',
        frequency_value: 1,
      },
    ],
  },
};

const mockWaterLog = {
  water_log_id: 'test-water-log-1',
  user_id: mockUsers.regular.user_id,
  date: new Date().toISOString().split('T')[0],
  target_amount: 2000,
  achieved_amount: 750,
};

const mockDailyEnvironment = {
  daily_environment_id: 'test-env-1',
  user_id: mockUsers.regular.user_id,
  date: new Date().toISOString().split('T')[0],
  temperature_avg: 22.5,
  humidity_avg: 55,
  uv_index: 5,
  recommended_spf: 30,
};

const mockRefreshToken = {
  refresh_id: 'test-refresh-1',
  user_id: mockUsers.regular.user_id,
  token: 'mock-refresh-token',
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  revoked: false,
};

const mockRoutineLog = {
  routine_log_id: 'test-log-1',
  routine_id: mockRoutines.morning.routine_id,
  user_id: mockUsers.regular.user_id,
  completed_at: new Date(),
};

const mockReactionGroup = {
  reaction_group_id: 'test-group-1',
  reaction_group_name: 'hydration',
};

const mockReaction = {
  reaction_id: 'test-reaction-1',
  reaction_group_id: mockReactionGroup.reaction_group_id,
  reaction_name: 'dryness',
};

module.exports = {
  mockUsers,
  mockItems,
  mockProducts,
  mockRoutines,
  mockWaterLog,
  mockDailyEnvironment,
  mockRefreshToken,
  mockRoutineLog,
  mockReactionGroup,
  mockReaction,
};