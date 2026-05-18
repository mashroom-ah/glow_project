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

//relstions

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

// associations from models

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;