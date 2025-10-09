import type { Sequelize } from 'sequelize';
import { User } from './User';
import { BibleBook } from './BibleBook';
import { BibleVersion } from './BibleVersion';
import { BibleVerse } from './BibleVerse';
import { BibleBookmark } from './BibleBookmark';
import { BibleNote } from './BibleNote';
import { ReadingSession } from './ReadingSession';
import { UserPreference } from './UserPreference';
import { UserProgress } from './UserProgress';

// Collection de tous les modèles
export const models = {
    User,
    BibleBook,
    BibleVersion,
    BibleVerse,
    BibleBookmark,
    BibleNote,
    ReadingSession,
    UserPreference,
    UserProgress
};

/**
 * Initialise tous les modèles Sequelize
 * @param sequelize Instance Sequelize
 */
export function initializeModels(sequelize: Sequelize) {
    // Initialiser tous les modèles
    Object.values(models).forEach((model: any) => {
        if (model.initialize) {
            model.initialize(sequelize);
        }
    });
}

/**
 * Définit toutes les associations entre les modèles
 */
export function setupAssociations() {
    // Définir toutes les associations
    Object.values(models).forEach((model: any) => {
        if (model.associate) {
            model.associate(models);
        }
    });
}

/**
 * Configuration complète des modèles : initialisation + associations
 * @param sequelize Instance Sequelize
 */
export function setupModels(sequelize: Sequelize) {
    initializeModels(sequelize);
    setupAssociations();
}

// Export des modèles individuels pour l'import direct
export {
    User,
    BibleBook,
    BibleVersion,
    BibleVerse,
    BibleBookmark,
    BibleNote,
    ReadingSession,
    UserPreference,
    UserProgress
};

// Export des types inférés (optionnel, les types sont automatiquement inférés avec InferAttributes)
export type { InferAttributes, InferCreationAttributes } from 'sequelize';
