export default defineAppConfig({
    ui: {
        colors: {
            // Palette principale orientée bleu
            primary: 'blue', // Bleu principal (blue-600)
            secondary: 'indigo', // Indigo complémentaire (indigo-600)
            accent: 'sky', // Bleu ciel pour les accents (sky-500)

            // Couleurs fonctionnelles
            success: 'emerald', // Vert succès (emerald-500)
            warning: 'amber', // Ambre attention (amber-500)
            error: 'red', // Rouge erreur (red-500)
            info: 'cyan', // Cyan information (cyan-500)

            // Couleurs neutres
            neutral: 'slate', // Gris neutre (slate-500)
            muted: 'gray', // Gris éteint (gray-400)

            // Couleurs théologiques spécialisées
            divine: 'violet', // Violet divin (violet-600)
            sacred: 'purple', // Pourpre sacré (purple-600)
            wisdom: 'yellow', // Jaune sagesse (yellow-500)
            peace: 'teal', // Sarcelle paix (teal-500)
            grace: 'rose', // Rose grâce (rose-400)
            truth: 'blue', // Bleu vérité (blue-700)
            faith: 'indigo', // Indigo foi (indigo-500)
            hope: 'sky' // Ciel espoir (sky-400)
        },

        // Palette graphique complète avec valeurs Tailwind
        chart: {
            // Palette principale (tons de bleu)
            primary: {
                50: '#eff6ff', // blue-50
                100: '#dbeafe', // blue-100
                200: '#bfdbfe', // blue-200
                300: '#93c5fd', // blue-300
                400: '#60a5fa', // blue-400
                500: '#3b82f6', // blue-500 - Couleur principale
                600: '#2563eb', // blue-600 - Couleur de base
                700: '#1d4ed8', // blue-700
                800: '#1e40af', // blue-800
                900: '#1e3a8a', // blue-900
                950: '#172554' // blue-950
            },

            // Palette secondaire (tons d'indigo)
            secondary: {
                50: '#eef2ff', // indigo-50
                100: '#e0e7ff', // indigo-100
                200: '#c7d2fe', // indigo-200
                300: '#a5b4fc', // indigo-300
                400: '#818cf8', // indigo-400
                500: '#6366f1', // indigo-500
                600: '#4f46e5', // indigo-600
                700: '#4338ca', // indigo-700
                800: '#3730a3', // indigo-800
                900: '#312e81', // indigo-900
                950: '#1e1b4b' // indigo-950
            },

            // Palette d'accent (tons de sky)
            accent: {
                50: '#f0f9ff', // sky-50
                100: '#e0f2fe', // sky-100
                200: '#bae6fd', // sky-200
                300: '#7dd3fc', // sky-300
                400: '#38bdf8', // sky-400
                500: '#0ea5e9', // sky-500
                600: '#0284c7', // sky-600
                700: '#0369a1', // sky-700
                800: '#075985', // sky-800
                900: '#0c4a6e', // sky-900
                950: '#082f49' // sky-950
            },

            // Couleurs complémentaires pour graphiques
            complementary: [
                '#3b82f6', // blue-500 - Principal
                '#6366f1', // indigo-500 - Secondaire
                '#0ea5e9', // sky-500 - Accent
                '#8b5cf6', // violet-500 - Divin
                '#06b6d4', // cyan-500 - Info
                '#10b981', // emerald-500 - Succès
                '#f59e0b', // amber-500 - Attention
                '#ef4444', // red-500 - Erreur
                '#6b7280', // gray-500 - Neutre
                '#ec4899' // pink-500 - Grace
            ],

            // Dégradés pour backgrounds
            gradients: {
                primary: 'from-blue-600 to-indigo-600',
                secondary: 'from-indigo-500 to-purple-600',
                accent: 'from-sky-400 to-blue-500',
                divine: 'from-violet-500 to-purple-600',
                peaceful: 'from-teal-400 to-blue-500',
                warm: 'from-amber-400 to-orange-500',
                cool: 'from-blue-400 to-cyan-500',
                spiritual: 'from-indigo-600 to-violet-600'
            }
        },

        // Variables CSS personnalisées
        variables: {
            light: {
                'background': '255 255 255', // white
                'foreground': '15 23 42', // slate-900
                'card': '248 250 252', // slate-50
                'card-foreground': '15 23 42', // slate-900
                'primary': '37 99 235', // blue-600
                'primary-foreground': '248 250 252', // slate-50
                'secondary': '79 70 229', // indigo-600
                'secondary-foreground': '248 250 252', // slate-50
                'muted': '241 245 249', // slate-100
                'muted-foreground': '100 116 139', // slate-500
                'accent': '59 130 246', // blue-500
                'accent-foreground': '248 250 252', // slate-50
                'border': '226 232 240', // slate-200
                'ring': '59 130 246' // blue-500
            },
            dark: {
                'background': '2 8 23', // slate-950
                'foreground': '248 250 252', // slate-50
                'card': '15 23 42', // slate-900
                'card-foreground': '248 250 252', // slate-50
                'primary': '59 130 246', // blue-500
                'primary-foreground': '15 23 42', // slate-900
                'secondary': '99 102 241', // indigo-500
                'secondary-foreground': '15 23 42', // slate-900
                'muted': '30 41 59', // slate-800
                'muted-foreground': '148 163 184', // slate-400
                'accent': '56 189 248', // sky-400
                'accent-foreground': '15 23 42', // slate-900
                'border': '51 65 85', // slate-700
                'ring': '56 189 248' // sky-400
            }
        }
    }
});
