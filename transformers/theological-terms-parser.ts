import { defineTransformer } from '@nuxt/content';

export default defineTransformer({
    name: 'theological-terms-parser',
    extensions: ['.md'],
    transform(content: any) {
        if (content.body && content.body.value) {
            content.body.value = processTermsInValue(content.body.value);
        }

        return content;
    }
});

/**
 * Fonction récursive pour traiter tous les éléments du contenu et parser les termes théologiques
 * @param value - Le contenu à traiter (string, array ou object)
 * @returns Le contenu traité
 */
function processTermsInValue(value: string | string[] | object): string | string[] | object {
    // Si la valeur est vide, on la retourne telle quelle
    if (!value) return value;

    // Si la valeur est un tableau, on traite chaque élément
    if (Array.isArray(value)) {
        const result: any[] = [];

        for (const item of value) {
            if (typeof item === 'string') {
                // On traite le texte pour détecter les termes théologiques
                const processed = processTextContent(item);
                // Si le texte commence et finit par des accolades, on ajoute le résultat
                if (item.startsWith('{') && item.endsWith('}')) result.push(processed);
                // Si le texte contient des accolades, on ajoute chaque partie séparément
                else if (item.includes('{') && item.includes('}')) result.push(...processed);
                // Sinon, on ajoute le texte traité
                else result.push(processed);
            } else {
                // Si ce n'est pas une string, on traite récursivement
                result.push(processTermsInValue(item));
            }
        }

        return result;
    }

    // Si la valeur est une string, on la traite
    if (typeof value === 'string') {
        return processTextContent(value);
    }

    // Si la valeur est un objet, on traite chaque clé
    if (typeof value === 'object' && value !== null) {
        const result: any = Array.isArray(value) ? [...value] : { ...value };

        Object.keys(result).forEach((key) => {
            result[key] = processTermsInValue(result[key]);
        });

        return result;
    }

    // Si aucun cas ne correspond, on retourne la valeur telle quelle
    return value;
}

/**
 * Traite le texte pour détecter et parser les termes théologiques au format {mot|terme}
 * @param text - Le texte à analyser
 * @returns Un tableau d'éléments AST ou le texte original
 */
function processTextContent(text: string): any {
    // Expression régulière pour matcher le pattern {mot|terme}
    const termRegex = /\{([^}|]+)\|([^}]+)\}/g;

    // Si aucun terme n'est trouvé, on retourne le texte original
    if (!termRegex.test(text)) {
        return text;
    }

    // Log pour debug : affiche le texte où des termes ont été trouvés
    console.log('Found theological terms in text:', text);

    // Réinitialise l'index du regex
    termRegex.lastIndex = 0;

    const parts = [];
    let lastIndex = 0;
    let match;

    // Boucle sur chaque match trouvé dans le texte
    while ((match = termRegex.exec(text)) !== null) {
        // Ajoute le texte avant le match
        if (match.index > lastIndex) {
            const textBefore = text.slice(lastIndex, match.index);
            if (textBefore.trim()) {
                parts.push(textBefore);
            }
        }

        // Ajoute le terme théologique sous forme de nœud AST
        parts.push([
            'theological-glossary-anchor', // Type de nœud
            {
                term: match[2] // Le terme après le |
            },
            match[1] // Le texte affiché avant le |
        ]);

        // Met à jour l'index pour la prochaine itération
        lastIndex = match.index + match[0].length;
    }

    // Ajoute le texte restant après le dernier match
    if (lastIndex < text.length) {
        const textAfter = text.slice(lastIndex);
        if (textAfter.trim()) {
            parts.push(textAfter);
        }
    }

    // Retourne le tableau d'éléments si plusieurs parties, sinon le texte ou l'élément unique
    return parts.length > 1 ? parts : (parts.length === 1 ? parts[0] : text);
}
