import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from 'sequelize';
import type { User } from './User';
import type { BibleVersion } from './BibleVersion';

export class UserPreference extends Model<InferAttributes<UserPreference>, InferCreationAttributes<UserPreference>> {
    declare id: CreationOptional<number>;
    declare defaultVersionId: ForeignKey<number> | null;
    declare notesPerVersion: CreationOptional<boolean>;
    declare bookmarksPerVersion: CreationOptional<boolean>;
    declare userId: ForeignKey<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Associations typées
    declare user?: NonAttribute<User>;
    declare defaultVersion?: NonAttribute<BibleVersion>;

    static associate(models: any) {
        // UserPreference belongs to User
        UserPreference.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

        // UserPreference belongs to BibleVersion (optional default version)
        UserPreference.belongsTo(models.BibleVersion, { foreignKey: 'defaultVersionId', as: 'defaultVersion' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        UserPreference.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                defaultVersionId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'bible_versions',
                        key: 'id'
                    }
                },
                notesPerVersion: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false
                },
                bookmarksPerVersion: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false
                },
                userId: {
                    type: DataTypes.INTEGER,
                    unique: true,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    defaultValue: null
                }
            },
            {
                sequelize: sequelizeInstance,
                tableName: 'user_preferences',
                timestamps: true,
                modelName: 'UserPreference'
            }
        );
    }
}
