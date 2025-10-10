import type { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
        await queryInterface.createTable('reading_sessions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            startTime: {
                type: Sequelize.DATE,
                allowNull: false
            },
            endTime: {
                type: Sequelize.DATE,
                allowNull: true
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            chaptersRead: {
                type: Sequelize.TEXT,
                defaultValue: '[]',
                allowNull: true
            },
            isCompleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            deviceType: {
                type: Sequelize.STRING,
                defaultValue: 'web',
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
            versionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'bible_versions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });
    },

    async down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.dropTable('reading_sessions');
    }
};
