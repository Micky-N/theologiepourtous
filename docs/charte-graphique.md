# 🎨 Charte Graphique - Théologie Vivante

## Vue d'ensemble
Cette charte graphique est orientée vers les tons de bleu, créant une atmosphère de confiance, sagesse et spiritualité appropriée pour un site de théologie.

## 🔵 Palette Principale (Bleus)

### Couleur Primaire - Blue
- **Usage** : Boutons principaux, liens, éléments d'interaction
- **Nuances** : `blue-50` à `blue-950`
- **Couleur de base** : `blue-600` (#2563eb)

### Couleur Secondaire - Indigo  
- **Usage** : Boutons secondaires, accents, navigation
- **Nuances** : `indigo-50` à `indigo-950` 
- **Couleur de base** : `indigo-600` (#4f46e5)

### Couleur d'Accent - Sky
- **Usage** : Highlights, informations, badges
- **Nuances** : `sky-50` à `sky-950`
- **Couleur de base** : `sky-500` (#0ea5e9)

## 🎯 Couleurs Fonctionnelles

| Fonction | Couleur | Usage |
|----------|---------|--------|
| **Success** | `emerald-500` | Messages de succès, validation |
| **Warning** | `amber-500` | Alertes, attention |
| **Error** | `red-500` | Erreurs, suppression |
| **Info** | `cyan-500` | Information, aide |

## 🕊️ Couleurs Théologiques Spécialisées

| Concept | Couleur | Signification | Usage |
|---------|---------|---------------|-------|
| **Divine** | `violet-600` | Divinité, majesté | Titres divins, références à Dieu |
| **Sacred** | `purple-600` | Sacré, saint | Textes sacrés, références bibliques |
| **Wisdom** | `yellow-500` | Sagesse, enseignement | Sections pédagogiques, conseils |
| **Peace** | `teal-500` | Paix, espoir | Messages d'espoir, promesses |
| **Grace** | `rose-400` | Grâce, amour | Témoignages, amour divin |
| **Truth** | `blue-700` | Vérité, foi | Doctrines, vérités bibliques |
| **Faith** | `indigo-500` | Foi, confiance | Encouragements, foi |
| **Hope** | `sky-400` | Espoir, avenir | Promesses, futur |

## 📊 Couleurs pour Graphiques

### Array de couleurs complémentaires
```javascript
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
  '#ec4899'  // pink-500 - Grace
]
```

## 🌅 Dégradés Recommandés

### Backgrounds spirituels
- **Primary** : `from-blue-600 to-indigo-600`
- **Divine** : `from-violet-500 to-purple-600` 
- **Peaceful** : `from-teal-400 to-blue-500`
- **Spiritual** : `from-indigo-600 to-violet-600`

### Accents chaleureux
- **Warm** : `from-amber-400 to-orange-500`
- **Cool** : `from-blue-400 to-cyan-500`

## 🎨 Utilisation Pratique

### Dans les Templates Vue
```vue
<!-- Bouton principal -->
<UButton color="primary">Commencer le parcours</UButton>

<!-- Badge théologique -->
<UBadge color="divine">Théologie Propre</UBadge>

<!-- Card avec gradient -->
<div class="bg-gradient-to-r from-blue-600 to-indigo-600">
  <!-- Contenu -->
</div>
```

### Classes Tailwind disponibles
- **Texte** : `text-blue-600`, `text-indigo-500`, etc.
- **Arrière-plan** : `bg-blue-50`, `bg-indigo-100`, etc.
- **Bordures** : `border-blue-200`, `border-indigo-300`, etc.
- **Hover** : `hover:bg-blue-500`, `hover:text-indigo-600`, etc.

## 🔍 Mode Sombre

Le système s'adapte automatiquement au mode sombre avec :
- Backgrounds plus sombres (`slate-950`, `slate-900`)
- Couleurs primaires ajustées pour le contraste
- Couleurs d'accent plus lumineuses (`sky-400` au lieu de `sky-500`)

## ✨ Bonnes Pratiques

1. **Hiérarchie** : Utilisez `blue-600` pour les éléments principaux, `indigo-500` pour les secondaires
2. **Contraste** : Vérifiez toujours le contraste texte/fond (WCAG AA)
3. **Cohérence** : Utilisez les couleurs théologiques de manière cohérente
4. **Dégradés** : Utilisez les dégradés prédéfinis pour maintenir l'harmonie
5. **Accessibilité** : Les couleurs ne doivent jamais être la seule façon de transmettre une information

Cette charte garantit une expérience visuelle harmonieuse et spirituellement appropriée pour votre plateforme de formation théologique.