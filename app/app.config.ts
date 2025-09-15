export default defineAppConfig({
    ui: {
        colors: {
            primary: 'blue',
            secondary: 'amber',
            success: 'emerald',
            warning: 'orange',
            error: 'red',
            info: 'sky',
            neutral: 'slate', // Couleurs spécifiques pour la théologie
            divine: 'violet', // Pour les aspects divins/spirituels
            sacred: 'indigo', // Pour les textes sacrés
            wisdom: 'amber', // Pour la sagesse et l'enseignement
            peace: 'emerald', // Pour la paix et l'espoir
            grace: 'rose', // Pour la grâce et l'amour
            truth: 'blue' // Pour la vérité et la foi
        },
        // Palette de couleurs théologiques personnalisées
        variables: {
            light: {
                'background': '255 255 255',
                'foreground': '15 23 42', // Couleurs théologiques
                'color-divine': '139 69 19', // Brun divin
                'color-sacred': '25 25 112', // Bleu marine sacré
                'color-wisdom': '184 134 11', // Or de la sagesse
                'color-peace': '34 197 94', // Vert de la paix
                'color-grace': '236 72 153', // Rose de la grâce
                'color-truth': '59 130 246' // Bleu de la vérité
            },
            dark: {
                'background': '2 8 23',
                'foreground': '248 250 252', // Couleurs théologiques en mode sombre
                'color-divine': '205 133 63', // Brun divin plus clair
                'color-sacred': '100 149 237', // Bleu marine plus clair
                'color-wisdom': '251 191 36', // Or plus lumineux
                'color-peace': '74 222 128', // Vert plus lumineux
                'color-grace': '244 114 182', // Rose plus doux
                'color-truth': '96 165 250' // Bleu plus lumineux
            }
        }
    }
})
