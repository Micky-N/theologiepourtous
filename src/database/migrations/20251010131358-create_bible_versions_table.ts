import type { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
        await queryInterface.createTable('bible_versions', {
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
            language: {
                type: Sequelize.STRING,
                defaultValue: 'fr',
                allowNull: false
            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            orderIndex: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },

    async down(queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> {
        await queryInterface.dropTable('bible_versions');
    }
};
