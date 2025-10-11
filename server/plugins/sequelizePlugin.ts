import { sequelize } from '~~/src/database/sequelize';
import { setupModels } from '~~/src/database/models';

export default defineNitroPlugin((_nitroApp) => {
    setupModels(sequelize);
});
