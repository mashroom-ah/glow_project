const { Sequelize, DataTypes } = require('sequelize');

const config =
  require('../../config/config')[
    process.env.NODE_ENV || 'development'
  ];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    logging: false,
  }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.AppUser = require('./appUser.model')(
  sequelize,
  DataTypes
);

db.RefreshToken = require('./refreshToken.model')(
  sequelize,
  DataTypes
);

db.Item = require('./item.model')(
  sequelize,
  DataTypes
);

db.ProductGroup = require('./productGroup.model')(
  sequelize,
  DataTypes
);

db.ActiveComponent = require('./activeComponent.model')(
  sequelize,
  DataTypes
);

db.GroupComponent = require('./groupComponent.model')(
  sequelize,
  DataTypes
);

db.Product = require('./product.model')(
  sequelize,
  DataTypes
);

db.Routine = require('./routine.model')(
  sequelize,
  DataTypes
);

db.RoutineStep = require('./routineStep.model')(
  sequelize,
  DataTypes
);

//relstions

// User
db.AppUser.hasMany(db.RefreshToken, {
  foreignKey: 'user_id',
});

db.RefreshToken.belongsTo(db.AppUser, {
  foreignKey: 'user_id',
});

db.AppUser.hasMany(db.Item, {
  foreignKey: 'user_id',
});

db.Item.belongsTo(db.AppUser, {
  foreignKey: 'user_id',
});

// Product
db.ProductGroup.hasMany(db.Product, {
  foreignKey: 'group_id',
});

db.Product.belongsTo(db.ProductGroup, {
  foreignKey: 'group_id',
});

// Component
db.ActiveComponent.hasMany(db.Product, {
  foreignKey: 'component_id',
});

db.Product.belongsTo(db.ActiveComponent, {
  foreignKey: 'component_id',
});

// group_component

db.ProductGroup.hasMany(db.GroupComponent, {
  foreignKey: 'group_id',
});

db.GroupComponent.belongsTo(db.ProductGroup, {
  foreignKey: 'group_id',
});

db.ActiveComponent.hasMany(db.GroupComponent, {
  foreignKey: 'component_id',
});

db.GroupComponent.belongsTo(db.ActiveComponent, {
  foreignKey: 'component_id',
});

// Routines

db.AppUser.hasMany(db.Routine, {
  foreignKey: 'user_id',
});

db.Routine.belongsTo(db.AppUser, {
  foreignKey: 'user_id',
});

db.Routine.hasMany(db.RoutineStep, {
  foreignKey: 'routine_id',
});

db.RoutineStep.belongsTo(db.Routine, {
  foreignKey: 'routine_id',
});

// Products in steps

db.Product.hasMany(db.RoutineStep, {
  foreignKey: 'product_id',
});

db.RoutineStep.belongsTo(db.Product, {
  foreignKey: 'product_id',
});

// associations from models

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;