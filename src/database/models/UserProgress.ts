import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from 'sequelize';

export class UserProgress extends Model<InferAttributes<UserProgress>, InferCreationAttributes<UserProgress>> {
    declare id: CreationOptional<number>;
    declare theme: string;
    declare lessons: CreationOptional<string | null>;
    declare startedAt: Date | null;
    declare userId: ForeignKey<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Associations typées
    declare user?: NonAttribute<any>;

    static associate(models: any) {
        // UserProgress belongs to User
        UserProgress.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        UserProgress.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                theme: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                lessons: {
                    type: DataTypes.TEXT,
                    defaultValue: '[]',
                    allowNull: true
                },
                startedAt: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                userId: {
                    type: DataTypes.INTEGER,
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
                tableName: 'user_progress',
                timestamps: true,
                modelName: 'UserProgress'
            }
        );
    }
}
