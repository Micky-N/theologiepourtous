import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from 'sequelize';

export class ReadingSession extends Model<InferAttributes<ReadingSession>, InferCreationAttributes<ReadingSession>> {
    declare id: CreationOptional<number>;
    declare startTime: Date;
    declare endTime: Date | null;
    declare duration: number | null;
    declare chaptersRead: CreationOptional<string | null>;
    declare isCompleted: CreationOptional<boolean>;
    declare deviceType: CreationOptional<string | null>;
    declare userId: ForeignKey<number>;
    declare versionId: ForeignKey<number>;
    declare createdAt: CreationOptional<Date>;

    // Associations typées
    declare user?: NonAttribute<any>;
    declare version?: NonAttribute<any>;

    static associate(models: any) {
        // ReadingSession belongs to User
        ReadingSession.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

        // ReadingSession belongs to BibleVersion
        ReadingSession.belongsTo(models.BibleVersion, { foreignKey: 'versionId', as: 'version' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        ReadingSession.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                startTime: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                endTime: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                duration: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                },
                chaptersRead: {
                    type: DataTypes.TEXT,
                    defaultValue: '[]',
                    allowNull: true
                },
                isCompleted: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false
                },
                deviceType: {
                    type: DataTypes.STRING,
                    defaultValue: 'web',
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
                versionId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'bible_versions',
                        key: 'id'
                    }
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                }
            },
            {
                sequelize: sequelizeInstance,
                tableName: 'reading_sessions',
                timestamps: true,
                updatedAt: false,
                modelName: 'ReadingSession'
            }
        );
    }
}
