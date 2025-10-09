import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'theologiepourtous',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mariadb',
    models: [__dirname + '/database/models']
});

export { Sequelize, sequelize };
