module.exports = (sequelize, DataTypes) => {
    const AppUser = sequelize.define(
        'AppUser',
        {
            user_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            password_hash: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            height: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },

            weight: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },

            birth_date: {
                type: DataTypes.DATEONLY,
            },

            activity_level: {
                type: DataTypes.ENUM(
                    'low',
                    'medium',
                    'high'
                ),
                allowNull: false,
            },

            water_avg: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 2000,
            },
        },
        {
            tableName: 'app_user',

            underscored: true,

            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    AppUser.associate = (models) => {
        AppUser.hasMany(models.RefreshToken, {
            foreignKey: 'user_id',
            as: 'refresh_tokens',
        });
    };

    return AppUser;
};