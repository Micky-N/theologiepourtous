import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from 'sequelize';
import type { BibleBook } from './BibleBook';
import type { BibleVerse } from './BibleVerse';
import type { User } from './User';

export class BibleBookmark extends Model<InferAttributes<BibleBookmark>, InferCreationAttributes<BibleBookmark>> {
    declare id: CreationOptional<number>;
    declare title: string | null;
    declare color: CreationOptional<string | null>;
    declare userId: ForeignKey<number>;
    declare bookId: ForeignKey<number>;
    declare verseId: ForeignKey<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Associations typées
    declare user?: NonAttribute<User>;
    declare book?: NonAttribute<BibleBook>;
    declare verse?: NonAttribute<BibleVerse>;

    static associate(models: any) {
        // BibleBookmark belongs to User
        BibleBookmark.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

        // BibleBookmark belongs to BibleBook
        BibleBookmark.belongsTo(models.BibleBook, { foreignKey: 'bookId', as: 'book' });

        // BibleBookmark belongs to BibleVerse
        BibleBookmark.belongsTo(models.BibleVerse, { foreignKey: 'verseId', as: 'verse' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        BibleBookmark.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                color: {
                    type: DataTypes.STRING,
                    defaultValue: 'blue',
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
                bookId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'bible_books',
                        key: 'id'
                    }
                },
                verseId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'bible_verses',
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
                tableName: 'bible_bookmarks',
                timestamps: true,
                modelName: 'BibleBookmark'
            }
        );
    }
}
