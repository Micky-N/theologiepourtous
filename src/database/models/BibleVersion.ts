import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';

export class BibleVersion extends Model<InferAttributes<BibleVersion>, InferCreationAttributes<BibleVersion>> {
    declare id: CreationOptional<number>;
    declare code: string;
    declare name: string;
    declare language: CreationOptional<string>;
    declare year: number | null;
    declare isActive: CreationOptional<boolean>;
    declare orderIndex: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Associations typées
    declare verses?: NonAttribute<any[]>;
    declare readingSessions?: NonAttribute<any[]>;
    declare userPreferences?: NonAttribute<any[]>;

    static associate(models: any) {
        // BibleVersion has many BibleVerses
        BibleVersion.hasMany(models.BibleVerse, { foreignKey: 'versionId', as: 'verses' });

        // BibleVersion has many ReadingSessions
        BibleVersion.hasMany(models.ReadingSession, { foreignKey: 'versionId', as: 'readingSessions' });

        // BibleVersion has many UserPreferences
        BibleVersion.hasMany(models.UserPreference, { foreignKey: 'defaultVersionId', as: 'userPreferences' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        BibleVersion.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                code: {
                    type: DataTypes.STRING,
                    unique: true,
                    allowNull: false
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                language: {
                    type: DataTypes.STRING,
                    defaultValue: 'fr',
                    allowNull: false
                },
                year: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
                },
                orderIndex: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false
                },
                createdAt: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    defaultValue: null
                }
            },
            {
                sequelize: sequelizeInstance,
                tableName: 'bible_versions',
                timestamps: true,
                modelName: 'BibleVersion'
            }
        );
    }
}
