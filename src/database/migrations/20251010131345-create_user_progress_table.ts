import type { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
        await queryInterface.createTable('user_progress', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            theme: {
                type: Sequelize.STRING,
                allowNull: false
            },
            lessons: {
                type: Sequelize.TEXT,
                defaultValue: '[]',
                allowNull: true
            },
            startedAt: {
                type: Sequelize.DATE,
                allowNull: true
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

    async down(queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> {
        await queryInterface.dropTable('user_progress');
    }
};
