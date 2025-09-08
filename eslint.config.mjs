// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
    rules: {
        '@stylistic/indent': ['error', 4, {
            SwitchCase: 1
        }],
        'no-console': 'off',
        '@stylistic/semi': 'error',
        'prefer-const': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'vue/valid-attribute-name': 'error',
        'vue/multi-word-component-names': 'off',
        'vue/no-v-html': 'off',
        'vue/require-default-prop': 'off',
        'vue/valid-v-slot': 'error',
        'vue/require-prop-types': 'error',
        'vue/max-attributes-per-line': ['error', {
            singleline: {
                max: 1
            },
            multiline: {
                max: 1
            }
        }],
        'vue/first-attribute-linebreak': ['error', {
            singleline: 'ignore',
            multiline: 'below'
        }],
        'vue/html-indent': ['error', 4, {
            attribute: 1,
            baseIndent: 1,
            closeBracket: 0,
            alignAttributesVertically: true,
            ignores: []
        }],
        'vue/v-on-event-hyphenation': ['error', 'always'],
        'vue/attributes-order': ['error', {
            order: [
                'DEFINITION',
                'LIST_RENDERING',
                'CONDITIONALS',
                'RENDER_MODIFIERS',
                'GLOBAL',
                ['UNIQUE', 'SLOT'],
                'TWO_WAY_BINDING',
                'OTHER_DIRECTIVES',
                'OTHER_ATTR',
                'EVENTS',
                'CONTENT'
            ],
            alphabetical: false
        }]
    }
})
