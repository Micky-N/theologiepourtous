import type { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
        await queryInterface.createTable('bible_books', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            code: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            testament: {
                type: Sequelize.ENUM('OLD', 'NEW'),
                allowNull: false
            },
            orderIndex: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            chapterCount: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false
            }
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable('bible_books');
    }
};
