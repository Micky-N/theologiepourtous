import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import type { Testament } from '../../enums/bibleType';

export class BibleBook extends Model<InferAttributes<BibleBook>, InferCreationAttributes<BibleBook>> {
    declare id: CreationOptional<number>;
    declare code: string;
    declare name: string;
    declare testament: Testament;
    declare orderIndex: number;
    declare chapterCount: number;
    declare createdAt: CreationOptional<Date>;

    // Associations typées
    declare bookmarks?: NonAttribute<any[]>;
    declare notes?: NonAttribute<any[]>;
    declare verses?: NonAttribute<any[]>;

    static associate(models: any) {
        // BibleBook has many BibleBookmarks
        BibleBook.hasMany(models.BibleBookmark, { foreignKey: 'bookId', as: 'bookmarks' });

        // BibleBook has many BibleNotes
        BibleBook.hasMany(models.BibleNote, { foreignKey: 'bookId', as: 'notes' });

        // BibleBook has many BibleVerses
        BibleBook.hasMany(models.BibleVerse, { foreignKey: 'bookId', as: 'verses' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        BibleBook.init(
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
                testament: {
                    type: DataTypes.ENUM('OLD', 'NEW'),
                    allowNull: false
                },
                orderIndex: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                chapterCount: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                createdAt: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW
                }
            },
            {
                sequelize: sequelizeInstance,
                tableName: 'bible_books',
                timestamps: true,
                updatedAt: false,
                modelName: 'BibleBook'
            }
        );
    }
}
