import type { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('USER', 'ADMIN'),
                defaultValue: 'USER',
                allowNull: false
            },
            lastLogin: {
                type: Sequelize.DATE,
                allowNull: true
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
        await queryInterface.dropTable('users');
    }
};
