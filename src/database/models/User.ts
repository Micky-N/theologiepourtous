import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import type { UserPreference } from './UserPreference';
import type { UserProgress } from './UserProgress';
import type { ReadingSession } from './ReadingSession';
import type { BibleNote } from './BibleNote';
import type { BibleBookmark } from './BibleBookmark';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare email: string;
    declare name: string;
    declare password: string;
    declare role: CreationOptional<'USER' | 'ADMIN'>;
    declare lastLogin: Date | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Associations typées
    declare bibleBookmarks?: NonAttribute<BibleBookmark[]>;
    declare bibleNotes?: NonAttribute<BibleNote[]>;
    declare readingSessions?: NonAttribute<ReadingSession[]>;
    declare preference?: NonAttribute<UserPreference>;
    declare progress?: NonAttribute<UserProgress[]>;

    static associate(models: any) {
        // User has many BibleBookmarks
        User.hasMany(models.BibleBookmark, { foreignKey: 'userId', as: 'bibleBookmarks' });

        // User has many BibleNotes
        User.hasMany(models.BibleNote, { foreignKey: 'userId', as: 'bibleNotes' });

        // User has many ReadingSessions
        User.hasMany(models.ReadingSession, { foreignKey: 'userId', as: 'readingSessions' });

        // User has one UserPreference
        User.hasOne(models.UserPreference, { foreignKey: 'userId', as: 'preference' });

        // User has many UserProgress
        User.hasMany(models.UserProgress, { foreignKey: 'userId', as: 'progress' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        User.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                email: {
                    type: DataTypes.STRING,
                    unique: true,
                    allowNull: false
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                role: {
                    type: DataTypes.ENUM('USER', 'ADMIN'),
                    defaultValue: 'USER',
                    allowNull: false
                },
                lastLogin: {
                    type: DataTypes.DATE,
                    allowNull: true
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
                tableName: 'users',
                timestamps: true,
                modelName: 'User'
            }
        );
    }
}
