import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from 'sequelize';

export class BibleVerse extends Model<InferAttributes<BibleVerse>, InferCreationAttributes<BibleVerse>> {
    declare id: CreationOptional<number>;
    declare chapter: number;
    declare verse: number;
    declare text: string;
    declare versionId: ForeignKey<number>;
    declare bookId: ForeignKey<number>;
    declare createdAt: CreationOptional<Date>;

    // Associations typées
    declare book?: NonAttribute<any>;
    declare version?: NonAttribute<any>;
    declare bookmarks?: NonAttribute<any[]>;
    declare notes?: NonAttribute<any[]>;

    static associate(models: any) {
        // BibleVerse belongs to BibleBook
        BibleVerse.belongsTo(models.BibleBook, { foreignKey: 'bookId', as: 'book' });

        // BibleVerse belongs to BibleVersion
        BibleVerse.belongsTo(models.BibleVersion, { foreignKey: 'versionId', as: 'version' });

        // BibleVerse has many BibleBookmarks
        BibleVerse.hasMany(models.BibleBookmark, { foreignKey: 'verseId', as: 'bookmarks' });

        // BibleVerse has many BibleNotes
        BibleVerse.hasMany(models.BibleNote, { foreignKey: 'verseId', as: 'notes' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        BibleVerse.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                chapter: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                verse: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                text: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                versionId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'bible_versions',
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
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                }
            },
            {
                sequelize: sequelizeInstance,
                tableName: 'bible_verses',
                timestamps: true,
                updatedAt: false,
                modelName: 'BibleVerse'
            }
        );
    }
}
