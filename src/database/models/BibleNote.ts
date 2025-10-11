import { type Sequelize, Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from 'sequelize';

export class BibleNote extends Model<InferAttributes<BibleNote>, InferCreationAttributes<BibleNote>> {
    declare id: CreationOptional<number>;
    declare title: string | null;
    declare content: string;
    declare isPrivate: CreationOptional<boolean>;
    declare userId: ForeignKey<number>;
    declare bookId: ForeignKey<number>;
    declare verseId: ForeignKey<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Associations typées
    declare user?: NonAttribute<any>;
    declare book?: NonAttribute<any>;
    declare verse?: NonAttribute<any>;

    static associate(models: any) {
        // BibleNote belongs to User
        BibleNote.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

        // BibleNote belongs to BibleBook
        BibleNote.belongsTo(models.BibleBook, { foreignKey: 'bookId', as: 'book' });

        // BibleNote belongs to BibleVerse
        BibleNote.belongsTo(models.BibleVerse, { foreignKey: 'verseId', as: 'verse' });
    }

    static initialize(sequelizeInstance: Sequelize) {
        BibleNote.init(
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
                content: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                isPrivate: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
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
                tableName: 'bible_notes',
                timestamps: true,
                modelName: 'BibleNote'
            }
        );
    }
}
