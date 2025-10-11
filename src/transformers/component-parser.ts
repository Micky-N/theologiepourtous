import { defineTransformer } from '@nuxt/content';

interface SpanNode {
    parser: string;
    param: string;
}

type ContentNode = [string, SpanNode, string] | any;

/**
 * Vérifie si un nœud est un span avec les propriétés parser et param
 */
function isSpanNodeWithParser(value: any[]): value is [string, SpanNode, string] {
    return value[0] === 'span'
      && value[1]
      && typeof value[1] === 'object'
      && 'parser' in value[1]
      && 'param' in value[1]
      && value[2];
}

/**
 * Transforme un nœud span en composant approprié selon le parser
 */
function transformSpanNode(parser: string, param: string, displayText: string): ContentNode {
    switch (parser) {
        case 'theological':
            return [
                'theological-glossary-anchor',
                { term: param },
                displayText
            ];
        case 'verse':
            return [
                'biblical-reference-popover',
                { verse: param },
                displayText
            ];
        default:
            // Retourner le nœud original si le parser n'est pas reconnu
            return [
                'span',
                { parser, param },
                displayText
            ];
    }
}

/**
 * Traite récursivement les nœuds de contenu pour transformer les spans avec parser
 */
function processTermsInValue(value: any): any {
    if (!value) return value;

    // Traitement des tableaux (nœuds)
    if (Array.isArray(value)) {
        // Vérifier si c'est un nœud span avec parser
        if (isSpanNodeWithParser(value)) {
            const [, attributes, displayText] = value;
            const { parser, param } = attributes;

            return transformSpanNode(parser, param, displayText);
        }

        // Traiter récursivement tous les éléments du tableau
        return value.map(item => processTermsInValue(item));
    }

    // Traitement des objets
    if (typeof value === 'object' && value !== null) {
        const result: Record<string, any> = {};

        for (const [key, val] of Object.entries(value)) {
            result[key] = processTermsInValue(val);
        }

        return result;
    }

    // Retourner les primitives inchangées
    return value;
}

export default defineTransformer({
    name: 'component-parser',
    extensions: ['.md'],
    transform(content: any) {
        if (content.body && content.body.value) {
            content.body.value = processTermsInValue(content.body.value);
        }

        return content;
    }
});
