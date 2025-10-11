import type { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
        await queryInterface.createTable('bible_notes', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            title: {
                type: Sequelize.STRING,
                allowNull: true
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            isPrivate: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            bookId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'bible_books',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            verseId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'bible_verses',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },

    async down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.dropTable('bible_notes');
    }
};
